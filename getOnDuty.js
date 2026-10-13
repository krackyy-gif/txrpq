const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { buildShiftEmbed, getShiftStats, startShift } = require('../utils/shiftTracker');

module.exports = {
  customID: 'get_on_duty',

  async execute(interaction, client) {
    if (!interaction.guildId) {
      return interaction.reply({ content: 'Duty status is only available in a server.', ephemeral: true });
    }

    const { isDockLinked } = require('../utils/docksystem');
    try {
      if (!await isDockLinked(interaction.user.id, interaction.guildId, client)) {
        return interaction.reply({
          content: 'Link your Roblox account through [DockSys](https://docksys.xyz/account) before going on duty.',
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error('Dock link check failed:', error.message);
      return interaction.reply({ content: 'Could not verify your DockSys link right now. Please try again.', ephemeral: true });
    }

    await startShift(interaction.guildId, interaction.user.id);
    client.onDutyUsers.add(`${interaction.guildId}:${interaction.user.id}`);
    const stats = await getShiftStats(interaction.guildId, interaction.user.id);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('go_off_duty')
        .setLabel('Stop Shift')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({
      embeds: [buildShiftEmbed(true, stats.totalMs)],
      components: [row],
    });
  },
};
