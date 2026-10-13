const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { hasPerm } = require('../utils/staffHelpers');
const { buildShiftEmbed, getShiftStats } = require('../utils/shiftTracker');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('Management tools.')
    .addSubcommand(sub =>
      sub
        .setName('shift')
        .setDescription('Show your current shift summary.')
    ),

  async execute(interaction) {
    if (!hasPerm(interaction)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const stats = await getShiftStats(interaction.guildId, interaction.user.id);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(stats.isOnDuty ? 'go_off_duty' : 'get_on_duty')
        .setLabel(stats.isOnDuty ? 'Stop Shift' : 'Start Shift')
        .setStyle(stats.isOnDuty ? ButtonStyle.Secondary : ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [buildShiftEmbed(stats.isOnDuty, stats.totalMs)], components: [row] });
  },
};
