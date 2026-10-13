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
      .setName("session-startup")
      .setDescription("Host a session start up."),
    async execute(interaction, client) {
      const embed1 = new EmbedBuilder()
        .setColor("#37373E")
        .setImage(""); // header image url
  
      const serverName = ""; // server name
      const serverOwner = ""; // server owner
      const joinCode = ""; // join code
      const embed2 = new EmbedBuilder()
        .setColor("#37373E")
        .setTitle("**Session Startup**")
        .setDescription(
          "> A server start-up has been initiated! Please ensure you have read and understood our regulations prior to joining.\n\n" +
            "**Game Information**\n" +
            "> **Server Name**: " + serverName + "\n" +
            "> **Server Owner**: " + serverOwner + "\n" +
            "> **Join Code**: " + joinCode + "\n\n"
        )
        .setImage(""); // footer image url
  
      const startLinkButton = new ButtonBuilder()
        .setLabel("Quick Join")
        .setURL("") // join url
        .setStyle(ButtonStyle.Link);
  
      const startButton = new ActionRowBuilder().addComponents(startLinkButton);

      if (!client.voteMap) client.voteMap = new Map();
      
      const activePollId = client.activePollId;
      const voters = activePollId ? client.voteMap.get(activePollId) : null;
      let votersList;
      if (!voters || voters.size === 0) {
        votersList = "**No voters!**";
      } else {
        const votersArray = [...voters.values()];
        votersList = votersArray.length
          ? votersArray.map((v) => `<@${v.userId}>`).join(", ")
          : "**No voters!**";
      }
  
      const roleId = ""; // role id to ping
      const channel = await interaction.guild.channels.fetch(channelId);
      await channel.send({
        content: `<@&${roleId}>\n-# ${votersList}`,
        embeds: [embed1, embed2],
        components: [startButton],
      });
  
      await interaction.reply({
        content:
          "**Successfully** hosted a session start up.",
        ephemeral: true,
      });
    },
  };
  
