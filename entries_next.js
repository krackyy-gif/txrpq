const { MessageFlags } = require('discord.js');
const Giveaway = require('../models/giveawaySchema');
const { renderPage } = require('./entires');

module.exports = {
  customID: 'entries_next',

  async execute(interaction) {
    await interaction.deferUpdate();

    const currentPage = Number(interaction.customId.split(':')[1]) + 1;

    let giveaway;
    try {
      giveaway = await Giveaway.findOne({ messageId: interaction.message.id });
    } catch {
      return interaction.editReply({ content: '❌ Database is currently unavailable.', flags: MessageFlags.Ephemeral });
    }

    if (!giveaway) return interaction.editReply({ content: '❌ Giveaway not found.' });
    return renderPage(interaction, giveaway, currentPage);
  },
};
