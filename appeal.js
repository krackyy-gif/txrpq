const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { Case } = require('../models/caseSchema');
const { COLORS, sendOutputLog } = require('../utils/staffHelpers');

function canReviewAppeals(message, client) {
  const superusers = (client.config.SUPERUSER_IDS || []).map(String);
  if (superusers.includes(message.author.id)) return true;

  const roleIds = [
    ...(client.config.INFRACTION_PERM_ROLE_ID || '').split(','),
    ...(client.config.PROMOTION_PERM_ROLE_ID || '').split(','),
  ].map(roleId => roleId.trim()).filter(Boolean);
  return roleIds.some(roleId => message.member.roles.cache.has(roleId));
}

async function getAppealCaseNumber(channel) {
  const topicMatch = channel.topic?.match(/appeal-case:(\d+)/i);
  if (topicMatch) return Number(topicMatch[1]);

  const messages = await channel.messages.fetch({ limit: 20 }).catch(() => null);
  for (const ticketMessage of messages?.values() || []) {
    for (const embed of ticketMessage.embeds) {
      const caseMatch = embed.description?.match(/\*\*Case:\*\*\s*#(\d+)/i);
      if (caseMatch) return Number(caseMatch[1]);
    }
  }
  return null;
}

module.exports = {
  name: 'appeal',
  prefixes: ['!','$'],

  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('❌ This command can only be used in a server.');
    }

    const decision = args[0]?.toLowerCase();
    if (decision) {
      if (!message.channel.name.startsWith('appeal-')) {
        return message.reply('Use `$appeal approve` or `$appeal deny` inside an appeal ticket.');
      }
      if (!canReviewAppeals(message, client)) {
        return message.reply('You do not have permission to review appeals.');
      }
      if (!['approve', 'deny'].includes(decision)) {
        return message.reply('Usage: `$appeal approve` or `$appeal deny`.');
      }

      const caseNumber = await getAppealCaseNumber(message.channel);
      if (!caseNumber) return message.reply('Could not identify the infraction for this appeal.');

      const record = await Case.findOne({ caseNumber, type: 'infraction' }).catch(() => null);
      if (!record) return message.reply(`No infraction found for appeal case **#${caseNumber}**.`);

      if (decision === 'approve') {
        if (record.revoked) return message.reply(`Infraction **#${caseNumber}** has already been revoked.`);
        record.revoked = true;
        await record.save();

        let targetName = record.username || record.userId;
        try {
          const user = await client.users.fetch(record.userId);
          targetName = user.tag;
        } catch {}

        await sendOutputLog(client, {
          action: 'Infraction Revoked - Appeal Approved',
          target: `${targetName} (${record.userId})`,
          moderator: message.author.tag,
          detail: `Case #${caseNumber} — ${record.punishment} | Logged via bot`,
          color: COLORS.SUCCESS,
        });

        const approvedEmbed = new EmbedBuilder()
          .setColor(COLORS.SUCCESS)
          .setDescription(`✅ Appeal approved by ${message.author}. Infraction **#${caseNumber}** has been revoked and logged via bot.`)
          .setTimestamp();
        return message.channel.send({ embeds: [approvedEmbed] });
      }

      await sendOutputLog(client, {
        action: 'Appeal Denied',
        target: `${record.username || record.userId} (${record.userId})`,
        moderator: message.author.tag,
        detail: `Case #${caseNumber} | Denied via bot`,
        color: COLORS.WARNING,
      });

      const deniedEmbed = new EmbedBuilder()
        .setColor(COLORS.WARNING)
        .setDescription(`Appeal for infraction **#${caseNumber}** denied by ${message.author}.`)
        .setTimestamp();
      return message.channel.send({ embeds: [deniedEmbed] });
    }

    const embed = new EmbedBuilder()
      .setTitle('⚖️ Staff Appeal')
      .setColor(0xF59E0B)
      .setDescription(
        'If you believe a punishment was unfair, incorrect, or made in error, you can submit an appeal here.\n\n' +
        'Click the button below to choose the infraction you want to appeal.'
      )
      .addFields(
        { name: 'Important', value: 'Please be respectful and provide clear information about why you are appealing.', inline: false },
      )
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('appeal:start')
      .setLabel('Start Appeal')
      .setStyle(ButtonStyle.Primary);

    await message.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(button)],
    });
  },
};
