const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  
  module.exports = {
    roles: ["1504531436181651637"], // role ids that can use this
    data: new SlashCommandBuilder()
      .setName("session-full")
      .setDescription("Send the session full embed."),
    async execute(interaction, client) {
      const channelId = "1503716487511146579"; // channel id
      const timestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`;
  
      const embed1 = new EmbedBuilder()
        .setColor("#37373E")
        .setImage(""); // header image url
  
      const embed2 = new EmbedBuilder()
        .setColor("#37373E")
        .setTitle("Session Full")
        .setDescription(
          `> The session has been full since **${timestamp}**. Keep trying to join us for some amazing roleplays!`
        )
        .setImage(""); // footer image url
  
      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Quick Join")
          .setStyle(ButtonStyle.Link)
          .setURL("") // join url
      );
  
      try {
        const channel = await client.channels.fetch(channelId);
        await channel.send({ embeds: [embed1, embed2], components: [button] });
        await interaction.reply({
          content: `**Successfully** marked the session full!`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Failed to send session full embeds:", error);
        await interaction.reply({
          content: "There was an error sending the session full embed.",
          ephemeral: true,
        });
      }
    },
  };
  
