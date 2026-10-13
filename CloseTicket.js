const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');

module.exports = {
  customID: 'closeTicket',

  async execute(interaction) {
    const REQUIRED_ROLE_ID = interaction.client.config.TICKET_CLOSE_ROLE_ID;
    if (REQUIRED_ROLE_ID && !interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
      return interaction.reply({
        content: 'You do not have permission to close tickets.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('closeTicketModal')
      .setTitle('Close Ticket');

    const reasonInput = new TextInputBuilder()
      .setCustomId('closeReason')
      .setLabel('Reason for closing the ticket')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter the reason here...')
      .setRequired(false);

    modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

    await interaction.showModal(modal);
  },
};
