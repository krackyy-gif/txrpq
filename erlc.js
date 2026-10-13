const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require('discord.js');
const axios = require('axios');

const BASE = 'https://api.erlc.gg/v1';

async function prc(path, key) {
  const { data } = await axios.get(`${BASE}${path}`, {
    headers: { 'Server-Key': key },
    timeout: 10000,
  });
  return data;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('erlc')
    .setDescription('ER:LC server commands.')
    .addSubcommand(sub => sub
      .setName('info')
      .setDescription('Show ER:LC server info.')
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'info') {
      await interaction.deferReply();

      const serverKey = client.config.ERLC_SERVER_KEY;
      if (!serverKey) return interaction.editReply('❌ `ERLC_SERVER_KEY` is not set. Use `/config` to add it.');

      try {
        const [server, staff, queue] = await Promise.all([
          prc('/server', serverKey),
          prc('/server/staff', serverKey).catch(() => []),
          prc('/server/queue', serverKey).catch(() => []),
        ]);

        let ownerName = `Unknown (${server.OwnerId ?? 'N/A'})`;
        let ownerLink = '';
        if (server.OwnerId) {
          const userRes = await axios.get(`https://users.roblox.com/v1/users/${server.OwnerId}`, { timeout: 5000 }).catch(() => null);
          if (userRes?.data?.name) {
            ownerName = userRes.data.name;
            ownerLink = `https://www.roblox.com/users/${server.OwnerId}/profile`;
          }
        }

        const staffCount = Array.isArray(staff) ? staff.length : 0;
        const queueCount = Array.isArray(queue) ? queue.length : 0;

        const text = [
          `# ER:LC Server Info`,
          `**Server Name:** ${server.Name ?? 'N/A'}`,
          `**Server Owner:** ${ownerLink ? `[${ownerName}](${ownerLink})` : ownerName}`,
          `**Join Code:** \`${server.JoinKey ?? 'N/A'}\``,
          `**Players:** ${server.CurrentPlayers ?? 0}/${server.MaxPlayers ?? 0}`,
          `**Queue:** ${queueCount}`,
          `**Staff In-Server:** ${staffCount}`,
        ].join('\n');

        const container = new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
        return interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container] });

      } catch (err) {
        const status = err.response?.status;
        if (status === 403) return interaction.editReply('❌ Invalid or unauthorized server key (403). Check your key in `/config`.');
        if (status === 429) return interaction.editReply('❌ Rate limited by the ER:LC API. Try again in a moment.');
        if (status === 404) return interaction.editReply('❌ Server not found (404). Make sure the server key is correct.');
        return interaction.editReply(`❌ Failed to fetch ER:LC info. (${status ? `HTTP ${status}` : err.message})`);
      }
    }
  },
};
