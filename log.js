const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const axios = require('axios');
const { hasPerm } = require('../utils/staffHelpers');
const { StaffBolo } = require('../models/staffPortal');

const LOG_CHANNEL_ID = '1558774598042910740';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription('Staff log actions.')
    .addSubcommand(sub => sub
      .setName('create')
      .setDescription('Create a moderation log entry.')
      .addStringOption(o => o.setName('username').setDescription('The username or player name.').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason for the log entry.').setRequired(true))
      .addStringOption(o => o.setName('type')
        .setDescription('Type of log entry.')
        .setRequired(true)
        .addChoices(
          { name: 'Kick', value: 'Kick' },
          { name: 'Warning', value: 'Warning' },
          { name: 'Ban', value: 'Ban' },
          { name: 'Ban BOLO', value: 'Ban BOLO' },
        )
      )
    ),

  async execute(interaction) {
    if (!hasPerm(interaction)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const username = interaction.options.getString('username');
    const reason = interaction.options.getString('reason');
    const type = interaction.options.getString('type');

    if (!username || !reason || !type) {
      return interaction.editReply('❌ Missing required command options. Use: `/log create <Username> <Reason> <Type>`');
    }

    const channel = interaction.client.channels.cache.get(LOG_CHANNEL_ID)
      || await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);

    if (!channel) {
      return interaction.editReply('❌ The configured log channel could not be found.');
    }

    let profileLink = null;
    try {
      const res = await axios.get('https://users.roblox.com/v1/users/by-username', {
        params: { username },
        timeout: 8000,
      });

      const robloxId = res.data?.data?.id ?? res.data?.id;
      if (robloxId) {
        profileLink = `https://www.roblox.com/users/${robloxId}/profile`;
      }
    } catch {
      profileLink = `https://www.roblox.com/search?Keyword=${encodeURIComponent(username)}`;
    }

    const isBolo = type === 'Ban BOLO';
    let boloRecord = null;
    if (isBolo) {
      try {
        boloRecord = await StaffBolo.create({
          guildId: interaction.guild.id,
          username,
          reason,
          requestedById: interaction.user.id,
          requestedByTag: interaction.user.tag,
        });
      } catch (error) {
        console.error('Could not persist Ban BOLO:', error.message);
        return interaction.editReply('❌ The Ban BOLO could not be saved. No review request was posted.');
      }
    }

    const embed = new EmbedBuilder()
      .setColor(type === 'Ban BOLO' ? 0xFF0000 : type === 'Ban' ? 0xD62828 : type === 'Kick' ? 0xF4B942 : 0xFFD166)
      .setTitle(`📋 ${type} Log`)
      .setDescription(`A staff log entry has been created for ${profileLink ? `[${username}](${profileLink})` : username}.${isBolo ? ' This Ban BOLO is pending review.' : ''}`)
      .addFields(
        { name: 'Player', value: username.slice(0, 200), inline: true },
        { name: 'Profile', value: profileLink ? `[Click here](${profileLink})` : 'N/A', inline: true },
        { name: 'Type', value: type, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: false },
        ...(isBolo ? [
          { name: 'Requester ID', value: interaction.user.id, inline: true },
          { name: 'Review Status', value: 'Pending', inline: true },
          { name: 'Portal BOLO ID', value: boloRecord.id, inline: false },
        ] : []),
      )
      .setTimestamp();

    const components = isBolo ? [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('bolo:approve')
        .setLabel('Approve & Ban')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('bolo:deny')
        .setLabel('Deny')
        .setStyle(ButtonStyle.Secondary),
    )] : [];

    const logMessage = await channel.send({ embeds: [embed], components });
    if (boloRecord) {
      boloRecord.sourceChannelId = channel.id;
      boloRecord.sourceMessageId = logMessage.id;
      await boloRecord.save();
    }
    await interaction.editReply(isBolo
      ? `✅ Ban BOLO submitted for review for **${username}**.`
      : `✅ Log entry created for **${username}** in the staff log channel.`);
  },
};
