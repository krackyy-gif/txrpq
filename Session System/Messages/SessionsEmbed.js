const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  const axios = require("axios");
  const SessionsModel = require("../../Models/SessionsModel");
  
  const channelId = ""; // your channel id
  
  module.exports = {
    name: "sessions",
    description: "Sends the session panel",
    roles: [""], // role ids that can use this
    async execute(message, client) {
      const serverKey = ""; // your server api key
      const apiBaseUrl = ""; // api base url (e.g. https://api.example.com/v1)

      const [playersRes, queueRes] = await Promise.allSettled([
        axios.get(`${apiBaseUrl}/server/players`, {
          headers: { "Server-Key": serverKey },
        }),
        axios.get(`${apiBaseUrl}/server/queue`, {
          headers: { "Server-Key": serverKey },
        }),
      ]);
  
      const players =
        playersRes.status === "fulfilled" ? playersRes.value.data : [];
      const queue = queueRes.status === "fulfilled" ? queueRes.value.data : [];

      const staffRoleId = ""; // staff role id
      await message.guild.members.fetch().catch(() => {});
      const moderatingCount = message.guild.members.cache.filter((m) =>
        m.roles.cache.has(staffRoleId)
      ).size;
  
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
  
      const now = Math.floor(Date.now() / 1000);
      const embed2 = new EmbedBuilder()
        .setColor("#37373E")
        .setTitle("` ⛰️ ` Session Status")
        .setDescription(`**Last Updated:** <t:${now}:R>`)
        .addFields(
          {
            name: "Players",
            value: `\`\`\`\n${
              Array.isArray(players) ? players.length : 0
            }\n\`\`\``,
            inline: true,
          },
          {
            name: "Moderating",
            value: `\`\`\`\n${
              Number.isFinite(moderatingCount) ? moderatingCount : 0
            }\n\`\`\``,
            inline: true,
          },
          {
            name: "Queue",
            value: `\`\`\`\n${Array.isArray(queue) ? queue.length : 0}\n\`\`\``,
            inline: true,
          }
        )
        .setImage(""); // footer image url
  
      const statusBtn = new ButtonBuilder()
        .setCustomId("status:noop")
        .setStyle(
          Array.isArray(players) && players.length >= 1
            ? ButtonStyle.Success
            : ButtonStyle.Danger
        )
        .setLabel(
          Array.isArray(players) && players.length >= 1
            ? "Server Online"
            : "Server Offline"
        )
        .setDisabled(true);
  
      const bellBtn = new ButtonBuilder()
        .setCustomId("sessionsRole:button")
        .setEmoji("") // emoji id
        .setStyle(ButtonStyle.Secondary);
  
      const row = new ActionRowBuilder().addComponents(statusBtn, bellBtn);
  
      const channel = await message.guild.channels.fetch(channelId);
      const reply = await channel.send({
        embeds: [tembed, embed1, embed2],
        components: [row],
      });
  
      await SessionsModel.deleteMany();
      await new SessionsModel({
        channelId: reply.channel.id,
        messageId: reply.id,
      }).save();
  
      message.delete().catch(() => {});

      const interval = setInterval(async () => {
        try {
          const [playersResU, queueResU] = await Promise.allSettled([
            axios.get(`${apiBaseUrl}/server/players`, {
              headers: { "Server-Key": serverKey },
            }),
            axios.get(`${apiBaseUrl}/server/queue`, {
              headers: { "Server-Key": serverKey },
            }),
          ]);
  
          const playersU =
            playersResU.status === "fulfilled" ? playersResU.value.data : [];
          const queueU =
            queueResU.status === "fulfilled" ? queueResU.value.data : [];
  
          await message.guild.members.fetch().catch(() => {});
          const moderatingCountU = message.guild.members.cache.filter((m) =>
            m.roles.cache.has(staffRoleId)
          ).size;
  
          const updatedEmbed = new EmbedBuilder()
            .setColor("#37373E")
            .setTitle("` ⛰️ ` Session Status")
            .setDescription(
              `**Last Updated:** <t:${Math.floor(Date.now() / 1000)}:R>`
            )
            .addFields(
              {
                name: "Players",
                value: `\`\`\`\n${
                  Array.isArray(playersU) ? playersU.length : 0
                }\n\`\`\``,
                inline: true,
              },
              {
                name: "Moderating",
                value: `\`\`\`\n${
                  Number.isFinite(moderatingCountU) ? moderatingCountU : 0
                }\n\`\`\``,
                inline: true,
              },
              {
                name: "Queue",
                value: `\`\`\`\n${
                  Array.isArray(queueU) ? queueU.length : 0
                }\n\`\`\``,
                inline: true,
              }
            )
            .setImage(""); // footer image url
  
          const statusBtnU = new ButtonBuilder()
            .setCustomId("status:noop")
            .setLabel(
              Array.isArray(playersU) && playersU.length >= 1
                ? "Server Online"
                : "Server Offline"
            )
            .setStyle(
              Array.isArray(playersU) && playersU.length >= 1
                ? ButtonStyle.Success
                : ButtonStyle.Danger
            )
            .setDisabled(true);
  
          const rowU = new ActionRowBuilder().addComponents(
            statusBtnU,
            new ButtonBuilder()
              .setCustomId("sessionsRole:button")
              .setEmoji("") // emoji id
              .setStyle(ButtonStyle.Secondary)
          );
  
          await reply.edit({
            embeds: [tembed, embed1, updatedEmbed],
            components: [rowU],
          });
        } catch (error) {
          if (error.code === 10008) {
            clearInterval(interval);
            return;
          }
          console.warn("[sessions] update error:", error);
        }
      }, 60 * 1000);
    },
  };
  
