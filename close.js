const { EmbedBuilder } = require('discord.js');
const Ticket = require('../models/ticketSchema');
const { sendOutputLog } = require('../utils/staffHelpers');

module.exports = {
  name: 'close',
  prefixes: ['$'],

  async execute(message, args, client) {
    if (!message.guild || !message.channel.name.startsWith('appeal-')) {
      return message.reply('`$close` can only be used inside an appeal ticket.');
    }

    const roleId = client.config.TICKET_CLOSE_ROLE_ID;
    if (roleId && !message.member.roles.cache.has(roleId)) {
      return message.reply('You do not have permission to close appeal tickets.');
    }

    const ticket = await Ticket.findOneAndUpdate(
      { channelId: message.channel.id },
      { status: 'closed', closedBy: message.author.id },
      { new: false },
    ).catch(error => {
      console.error('Could not update closed appeal ticket:', error);
      return null;
    });

    await sendOutputLog(client, {
      action: 'Appeal Ticket Closed',
      target: ticket?.userId || message.channel.name,
      moderator: message.author.tag,
      detail: `Channel: #${message.channel.name}${args.length ? ` | ${args.join(' ')}` : ''}`,
    });

    const embed = new EmbedBuilder()
      .setColor('#242429')
      .setDescription(`This appeal ticket is closing. Closed by ${message.author}.`);
    await message.channel.send({ embeds: [embed] });
    setTimeout(() => message.channel.delete('Appeal ticket closed').catch(() => {}), 3000);
  },
};