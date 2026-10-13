const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags
} = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("erlc-info")
    .setDescription("Show ER:LC server info"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const headers = {
        "server-key": ""
      };

      const { data: server } = await axios.get(
        "https://api.erlc.gg/v2/server?Staff=true&Queue=true",
        { headers }
      );

      let ownerName = `Unknown (${server.OwnerId ?? "N/A"})`;
      let ownerLink = "";

      if (server.OwnerId) {
        const userRes = await axios.get(`https://users.roblox.com/v1/users/${server.OwnerId}`);
        ownerName = userRes.data?.name || ownerName;
        ownerLink = `https://www.roblox.com/users/${server.OwnerId}/profile`;
      }

      const countedStaffIds = new Set();

      if (server.OwnerId) {
        countedStaffIds.add(String(server.OwnerId));
      }

      if (Array.isArray(server.CoOwnerIds)) {
        for (const id of server.CoOwnerIds) {
          if (id !== null && id !== undefined) {
            countedStaffIds.add(String(id));
          }
        }
      }

      if (server.Staff?.Admins && typeof server.Staff.Admins === "object") {
        for (const id of Object.keys(server.Staff.Admins)) {
          countedStaffIds.add(String(id));
        }
      }

      if (server.Staff?.Mods && typeof server.Staff.Mods === "object") {
        for (const id of Object.keys(server.Staff.Mods)) {
          countedStaffIds.add(String(id));
        }
      }

      const helperIds = new Set();

      if (server.Staff?.Helpers && typeof server.Staff.Helpers === "object") {
        for (const id of Object.keys(server.Staff.Helpers)) {
          helperIds.add(String(id));
        }
      }

      const queueCount = Array.isArray(server.Queue) ? server.Queue.length : 0;

      const text = [
        `# ER:LC Server Info`,
        `**Server Name:** ${server.Name ?? "N/A"}`,
        `**Server Owner:** [${ownerName}](${ownerLink})`,
        `**Server Code:** ${server.JoinKey ?? "N/A"}`,
        `**Players:** ${server.CurrentPlayers ?? 0}/${server.MaxPlayers ?? 0}`,
        `**Queue:** ${queueCount}`,
        `**Staff Count:** ${countedStaffIds.size}`,
        `**Helper Count:** ${helperIds.size}`
      ].join("\n");

      const container = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(text)
      );

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
      });
    } catch (err) {
      console.error("ERLC info error:", err.response?.status, err.response?.data || err.message);

      if (err.response?.status === 403) {
        return interaction.editReply("ERLC rejected the request with 403. Invalid server key.");
      }

      await interaction.editReply("Failed to fetch ER:LC server info.");
    }
  }
};
