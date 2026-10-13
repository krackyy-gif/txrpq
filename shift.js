const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { hasPerm } = require('../utils/staffHelpers');
const { formatShiftTime, getShiftLeaderboard } = require('../utils/shiftTracker');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shift')
    .setDescription('View shift rankings.')
    .addSubcommand(sub => sub
      .setName('leaderboard')
      .setDescription('Show the staff members with the most recorded duty time.')
    ),

  async execute(interaction) {
    if (!hasPerm(interaction)) {
      return interaction.reply({
        content: 'You do not have permission to view the shift leaderboard.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();
    const leaderboard = await getShiftLeaderboard(interaction.guildId, 10);
    if (!leaderboard.length) {
      return interaction.editReply('No shift time has been recorded yet.');
    }

    const description = leaderboard.map((entry, index) =>
      `**${index + 1}.** <@${entry.userId}>  |  ${formatShiftTime(entry.totalMs)}`
    ).join('\n');
    const embed = new EmbedBuilder()
      .setTitle('Shift Leaderboard')
      .setDescription(description)
      .setColor(0x22c55e)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};