const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

const TICKET_LABELS = {
  '6r6SScjnYI': 'General Support',
  'UX0vh0SS8o': 'Internal Affairs Support',
  'FP2suQkxUI': 'Management Support',
  'me3Mz00V9q': 'Foundership Support',
};

module.exports = {
  customID: 'ticketDropdown',

  async execute(interaction) {
    const selected = interaction.values[0];
    const label = TICKET_LABELS[selected] ?? 'Support';

    const modal = new ModalBuilder()
      .setCustomId(`ticketModal_${selected}`)
      .setTitle(`${label}`);

    const inquiryInput = new TextInputBuilder()
      .setCustomId('inquiry')
      .setLabel('Inquiry')
      .setPlaceholder('Please describe your issue in detail.')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(inquiryInput));

    await interaction.showModal(modal);
  },
};
