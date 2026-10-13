const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  const crypto = require("crypto");
  
  const channelId = "1503716487511146579"; // channel id
  
  module.exports = {
    roles: ["1504531436181651637"], // role ids that can use this
    data: new SlashCommandBuilder()
      .setName("session-vote")
      .setDescription("Host a session vote."),
    generateSessionId() {
      return crypto.randomBytes(6).toString("hex");
    },
    async execute(interaction, client) {
      const pollSessionId = this.generateSessionId();
  
      // Embed 1: Header image
      const embed1 = new EmbedBuilder()
        .setColor("#37373E")
        .setImage(""); // header image url
  
      // Embed 2: Session vote details
      const embed2 = new EmbedBuilder()
        .setColor("#37373E")
        .setTitle("Session Vote")
        .setDescription(
          `> Please cast your vote below for the upcoming session. We require **[number] votes** to start a session and if you vote, you are committing to join. Failure to participate after voting will result in moderation.`
        )
        .setImage(""); // footer image url
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`vote:button_${pollSessionId}`)
          .setEmoji("<:Check:1429634017879130272>")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`viewvote:button_${pollSessionId}`)
          .setLabel("View Voters")
          .setEmoji("<:directed:1429912362109898913>")
          .setStyle(ButtonStyle.Secondary)
      );
  
      const roleId = ""; // role id (leave empty to use @here)
      const channel = await client.channels.fetch(channelId);
      await channel.send({
        content: roleId ? `<@&${roleId}>` : "@here",
        embeds: [embed1, embed2],
        components: [row],
      });
  
      await interaction.reply({
        content:
          "**Successfully** hosted a session vote.",
        ephemeral: true,
      });
    },
  };
  
