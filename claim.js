const { EmbedBuilder } = require('discord.js');
const Ticket = require('../models/ticketSchema');

module.exports = {
  name: 'claim',
  prefixes: ['$'],

  async execute(message) {
    if (!message.guild || !message.channel.name.startsWith('appeal-')) {
      return message.reply('`$claim` can only be used inside an appeal ticket.');
    }

    const roleId = message.client.config.TICKET_CLAIM_ROLE_ID;
    if (roleId && !message.member.roles.cache.has(roleId)) {
      return message.reply('You do not have permission to claim appeal tickets.');
    }

    const ticket = await Ticket.findOne({ channelId: message.channel.id }).catch(() => null);
    if (ticket?.claimStatus === 'claimed') {
      return message.reply(`This appeal is already claimed by <@${ticket.claimedBy}>.`);
    }

    await Ticket.findOneAndUpdate(
      { channelId: message.channel.id },
      { claimedBy: message.author.id, claimStatus: 'claimed' },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).catch(error => console.error('Could not save appeal claim:', error));

    const embed = new EmbedBuilder()
      .setColor('#242429')
      .setDescription(`This appeal has been claimed by ${message.author}.`);
    return message.channel.send({ embeds: [embed] });
  },
};