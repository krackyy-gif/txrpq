const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS, FOOTER_TEXT } = require('../utils/staffHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot health and latency.'),

  async execute(interaction) {
    const latency  = Math.round(interaction.client.ws.ping);
    const uptimeMs = interaction.client.uptime || 0;
    const totalSec = Math.floor(uptimeMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const color  = latency < 100 ? COLORS.SUCCESS : latency < 200 ? COLORS.WARNING : COLORS.DANGER;
    const status = latency < 100 ? 'Excellent'    : latency < 200 ? 'Good'         : 'Poor';

    const embed = new EmbedBuilder()
      .setTitle('🏙️  Bot Health Check')
      .setColor(color)
      .addFields(
        { name: 'Latency', value: `${latency}ms — ${status}`,    inline: true },
        { name: 'Uptime',  value: `${h}h ${m}m ${s}s`,           inline: true },
        { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
      )
      .setFooter({ text: FOOTER_TEXT })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
