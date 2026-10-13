const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags
} = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playercount")
    .setDescription("Get ERLC server player count"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const headers = {
        "server-key": ""
      };

      const [serverRes, queueRes] = await Promise.all([
        axios.get("https://api.erlc.gg/v1/server", { headers }),
        axios.get("https://api.erlc.gg/v1/server/queue", { headers })
      ]);

      const players = serverRes.data.CurrentPlayers ?? 0;
      const max = serverRes.data.MaxPlayers ?? 0;
      const queue = Array.isArray(queueRes.data) ? queueRes.data.length : 0;

      const container = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ERLC Server Status\nPlayers: ${players}/${max}\nQueue: ${queue}`
        )
      );

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
      });
    } catch (err) {
      console.error("ERLC error:", err.response?.status, err.response?.data || err.message);

      if (err.response?.status === 403) {
        return interaction.editReply("ERLC rejected the request with 403. Your server key is invalid or not authorized.");
      }

      await interaction.editReply("Failed to fetch player count.");
    }
  }
};
