const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');
const Ticket = require('../models/ticketSchema');

module.exports = {
  customID: 'unclaimTicket',

  async execute(interaction) {
    const channel = interaction.channel;
    const user = interaction.user;

    const claimButton = new ButtonBuilder()
      .setCustomId('claimTicket')
      .setLabel('Claim')
      .setStyle(ButtonStyle.Secondary);

    const closeButton = new ButtonBuilder()
      .setCustomId('closeTicket')
      .setLabel('Close')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

    await interaction.update({ components: [row] });

    const embed = new EmbedBuilder()
      .setDescription('This ticket has been unclaimed.')
      .setColor('#242429');

    await channel.send({ embeds: [embed] });

    try {
      const ticket = await Ticket.findOne({ channelId: channel.id });
      if (ticket) {
        if (ticket.claimedBy !== user.id) {
          return channel.send({ content: `<@${user.id}> You can't unclaim a ticket you didn't claim.` });
        }
        ticket.claimedBy = null;
        ticket.claimStatus = 'unclaimed';
        await ticket.save();
      }
    } catch (err) {
      console.error('Error updating ticket unclaim in DB:', err);
    }
  },
};
