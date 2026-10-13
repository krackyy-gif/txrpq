const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  
  const channelId = "1503716487511146579"; // channel id
  
  module.exports = {
    roles: ["1504531436181651637"], // role ids that can use this
    data: new SlashCommandBuilder()
      .setName("session-shutdown")
      .setDescription("Host a session shutdown."),
  
    async execute(interaction, client) {
      const embed1 = new EmbedBuilder()
        .setColor("#37373E")
        .setImage(""); // header image url
  
      const notificationRoleId = ""; // notification role id
      const embed2 = new EmbedBuilder()
        .setColor("#37373E")
        .setTitle("Session Shutdown")
        .setDescription(
          "> The in-game server is currently on shutdown. Please refrain from attempting to join during this time. Be sure to obtain the <@&" + notificationRoleId + "> role to be notified for the next session!"
        )
        .setImage(""); // footer image url
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("sessionsRole:button")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("") // emoji (format: <:name:id> or just id)
      );
  
      const channel = await interaction.guild.channels.fetch(channelId);
      await channel.send({ embeds: [embed1, embed2], components: [row] });
  
      await interaction.reply({
        content:
          "**Successfully** hosted a session shutdown.",
        ephemeral: true,
      });
    },
  };
  
