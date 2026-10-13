const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');
const Ticket = require('../models/ticketSchema');

module.exports = {
  customID: 'claimTicket',

  async execute(interaction) {
    const REQUIRED_ROLE_ID = interaction.client.config.TICKET_CLAIM_ROLE_ID;
    if (REQUIRED_ROLE_ID && !interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
      return interaction.reply({
        content: 'You do not have permission to claim tickets.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const user = interaction.user;
    const channel = interaction.channel;

    const unclaimButton = new ButtonBuilder()
      .setCustomId('unclaimTicket')
      .setLabel('Unclaim')
      .setStyle(ButtonStyle.Secondary);

    const closeButton = new ButtonBuilder()
      .setCustomId('closeTicket')
      .setLabel('Close')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(unclaimButton, closeButton);

    await interaction.update({ components: [row] });

    const embed = new EmbedBuilder()
      .setDescription(`This ticket has been claimed by <@${user.id}>.`)
      .setColor('#242429');

    await channel.send({ embeds: [embed] });

    try {
      await Ticket.findOneAndUpdate(
        { channelId: channel.id },
        { claimedBy: user.id, claimStatus: 'claimed' },
        { new: true }
      );
    } catch (err) {
      console.error('Error updating ticket claim in DB:', err);
    }
  },
};
