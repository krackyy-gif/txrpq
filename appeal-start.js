const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');
const { Case } = require('../models/caseSchema');

module.exports = {
  customID: 'appeal:start',

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const cases = await Case.find({
      userId: interaction.user.id,
      type: 'infraction',
    }).sort({ createdAt: -1 }).limit(25);

    if (!cases.length) {
      return interaction.editReply({
        content: '❌ You do not have any infraction history to appeal yet.',
        components: [],
      });
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('appeal:select')
      .setPlaceholder('Select the infraction you want to appeal')
      .addOptions(
        cases.map(record => {
          const punishment = record.punishment || 'Infraction';
          const reason = record.reason || 'No reason provided';
          const label = `#${record.caseNumber || 'N/A'} | ${punishment} | ${reason}`;

          return new StringSelectMenuOptionBuilder()
            .setLabel(label.slice(0, 100))
            .setDescription(`${punishment} — ${reason.slice(0, 80)}`)
            .setValue(String(record._id));
        })
      );

    await interaction.editReply({
      content: 'Choose the infraction you want to appeal below.',
      components: [new ActionRowBuilder().addComponents(select)],
    });
  },
};
