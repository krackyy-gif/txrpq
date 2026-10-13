const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Case } = require('../models/caseSchema');
const Ticket = require('../models/ticketSchema');

const APPEAL_CATEGORY_ID = '1557515722761044050';

module.exports = {
  customID: 'appeal:select',

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const caseId = interaction.values[0];
    const caseRecord = await Case.findOne({
      _id: caseId,
      userId: interaction.user.id,
      type: 'infraction',
    }).catch(() => null);

    if (!caseRecord) {
      return interaction.editReply('❌ I could not find that infraction record for your account.');
    }

    const selectedType = caseRecord.punishment || 'Infraction';
    const caseReason = caseRecord.reason || 'No reason provided';
    const moderatorId = caseRecord.issuedById || null;
    const caseSummary = `Infraction | ${selectedType} | ${caseReason}`;

    const guild = interaction.guild;
    const channelName = `appeal-${interaction.user.username}-${caseRecord.caseNumber || 'case'}`
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 80);

    let targetChannel;
    try {
      const staffRoleIds = [...new Set([
        client.config.TICKET_CLAIM_ROLE_ID,
        ...(client.config.INFRACTION_PERM_ROLE_ID || '').split(','),
        ...(client.config.PROMOTION_PERM_ROLE_ID || '').split(','),
      ].map(roleId => roleId.trim()).filter(Boolean))];
      const permissionOverwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
        {
          id: client.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory],
        },
        ...staffRoleIds.map(id => ({
          id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        })),
      ];
      if (moderatorId) {
        permissionOverwrites.push({
          id: moderatorId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        });
      }

      targetChannel = await guild.channels.create({
        name: channelName,
        type: 0,
        parent: APPEAL_CATEGORY_ID,
        topic: `appeal-case:${caseRecord.caseNumber};appeal-user:${interaction.user.id}`,
        permissionOverwrites,
        reason: `Appeal for ${caseSummary} by ${interaction.user.tag}`,
      });
    } catch (error) {
      console.error('Appeal channel create error:', error);
      return interaction.editReply('❌ I could not create the appeal channel in the configured category.');
    }

    await Ticket.create({
      userId: interaction.user.id,
      username: interaction.user.username,
      channelId: targetChannel.id,
      ticketId: `AP-${caseRecord.caseNumber || caseRecord.id}`,
      type: 'appeal',
    }).catch(error => console.error('Could not save appeal ticket:', error));

    const ping = moderatorId ? `<@${moderatorId}>` : '@here';

    const appealEmbed = new EmbedBuilder()
      .setTitle(`📝 Appeal: ${selectedType}`)
      .setColor(0xF59E0B)
      .setDescription(
        `A user has submitted an appeal for **${selectedType}**.\n\n` +
        `**User:** ${interaction.user} (${interaction.user.tag})\n` +
        `**Case:** #${caseRecord.caseNumber || 'N/A'}\n` +
        `**Infraction:** ${caseSummary}\n` +
        `**Date:** <t:${Math.floor(Date.now() / 1000)}:F>`
      )
      .addFields(
        { name: 'Appeal Reason', value: 'Please provide the reason for the appeal in the thread or below.', inline: false },
      )
      .setTimestamp();

    await targetChannel.send({
      content: `${ping} New appeal submitted.`,
      embeds: [appealEmbed],
    });

    await interaction.editReply({
      content: `✅ Your appeal has been submitted in ${targetChannel}.`,
      components: [],
    });
  },
};
