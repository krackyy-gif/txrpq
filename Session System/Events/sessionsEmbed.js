const {
    EmbedBuilder,
    Client,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
  } = require("discord.js");
  const axios = require("axios");
  const SessionsModel = require("../Models/SessionsModel");
  
  module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
      const currentSession = await SessionsModel.findOne();
      if (!currentSession) return;
  
      const sessionChannelId = ""; // session channel id
      let channel;
      try {
        channel = await client.channels.fetch(currentSession.channelId);
        if (channel.id !== sessionChannelId) return;
      } catch (error) {
        console.warn(
          `Failed to fetch session channel (${currentSession.channelId}): ${error.message}`
        );
        return;
      }
  
      let message;
      try {
        message = await channel.messages.fetch(currentSession.messageId);
      } catch (error) {
        if (error.code === 10008) return;
        console.warn(
          `Failed to fetch session message (${currentSession.messageId}): ${error.message}`
        );
        return;
      }
  
      const serverKey = client.config.prcKey;
  
      const tembed = new EmbedBuilder()
        .setColor("#37373E")
        .setImage(""); // header image url
  
      const notificationRoleId = ""; // notification role id
      const weekdayTime = ""; // weekday timestamp (e.g. 1761163200)
      const weekendTime = ""; // weekend timestamp (e.g. 1761148800)
      const embed1 = new EmbedBuilder()
        .setColor("#37373E")
        .setDescription(
          "> You will be notified here when a staff member initiates a session. Do not attempt to join the server when it is shutdown.\n\n> Ensure you have the <@&" + notificationRoleId + "> role to be notified when a session occurs. Our sessions typically occur sometime around <t:" + weekdayTime + ":t> on the weekdays and <t:" + weekendTime + ":t> on the weekends."
        )
        .setImage(""); // invisible spacer image (optional)

      if (!client.sessionIntervals) client.sessionIntervals = new Map();
      
      const existingInterval = client.sessionIntervals.get(channel.id);
      if (existingInterval) clearInterval(existingInterval);
  
      const updateInterval = setInterval(async () => {
        try {
          const apiBaseUrl = ""; // api base url (e.g. https://api.example.com/v1)
          const [playerRes, queueRes] = await Promise.all([
            axios.get(`${apiBaseUrl}/server/players`, {
              headers: { "Server-Key": serverKey },
            }),
            axios.get(`${apiBaseUrl}/server/queue`, {
              headers: { "Server-Key": serverKey },
            }),
          ]);
  
          const players = playerRes.data;
          const queue = queueRes.data;
  
          const guild = await client.guilds.fetch(channel.guild.id);
          const members = await guild.members.fetch();
          const staffRoleId = ""; // staff role id
  
          const moderatingCount = members.filter((m) =>
            m.roles.cache.has(staffRoleId)
          ).size;

          const now = Math.floor(Date.now() / 1000);
  
          const updatedEmbed = new EmbedBuilder()
            .setColor("#37373E")
            .setTitle("Session Status")
            .setDescription(`**Last Updated:** <t:${now}:R>`)
            .addFields(
              {
                name: "Players",
                value: `\`\`\`\n${players.length}\n\`\`\``,
                inline: true,
              },
              {
                name: "Moderating",
                value: `\`\`\`\n${moderatingCount}\n\`\`\``,
                inline: true,
              },
              {
                name: "Queue",
                value: `\`\`\`\n${queue.length}\n\`\`\``,
                inline: true,
              }
            )
            .setImage(""); // footer image url
  
          const button =
            players.length >= 1
              ? new ButtonBuilder()
                  .setCustomId("n/a")
                  .setLabel("Server Online")
                  .setStyle(ButtonStyle.Success)
                  .setDisabled(true)
              : new ButtonBuilder()
                  .setCustomId("n/a")
                  .setLabel("Server Offline")
                  .setStyle(ButtonStyle.Danger)
                  .setDisabled(true);
  
          const bellButton = new ButtonBuilder()
            .setCustomId("sessionsRole:button")
            .setEmoji("") // emoji (format: <:name:id> or just id)
            .setStyle(ButtonStyle.Secondary);
  
          const row = new ActionRowBuilder().addComponents(button, bellButton);
  
          await message.edit({
            embeds: [tembed, embed1, updatedEmbed],
            components: [row],
          });
        } catch (error) {
          console.warn("Failed to update session panel:", error.message);
        }
      }, 60 * 1000);

      client.sessionIntervals.set(channel.id, updateInterval);
    },
  };
  
