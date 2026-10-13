const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { buildShiftEmbed, endShift, getShiftStats } = require('../utils/shiftTracker');

module.exports = {
  customID: 'go_off_duty',

  async execute(interaction, client) {
    if (interaction.guildId) {
      await endShift(interaction.guildId, interaction.user.id);
      client.onDutyUsers.delete(`${interaction.guildId}:${interaction.user.id}`);
    }
    const stats = await getShiftStats(interaction.guildId, interaction.user.id);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('get_on_duty')
        .setLabel('Start Shift')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.update({
      embeds: [buildShiftEmbed(false, stats.totalMs)],
      components: [row],
    });
  },
};
