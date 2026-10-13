const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { hasPerm } = require('../utils/staffHelpers');

const LOG_CHANNEL_ID = '1558774598042910740';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logsearch')
    .setDescription('Search the staff log channel for a username.')
    .addStringOption(o =>
      o.setName('username')
        .setDescription('Username to search for in the log history.')
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('limit')
        .setDescription('Maximum results to show (default: 10).')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20)
    ),

  async execute(interaction) {
    if (!hasPerm(interaction)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const query = interaction.options.getString('username');
    if (!query) {
      return interaction.editReply('❌ Missing required username option. Use: `/logsearch <Username>`');
    }

    const limit = interaction.options.getInteger('limit') ?? 10;
    const searchTerm = query.trim().toLowerCase();

    const channel = interaction.client.channels.cache.get(LOG_CHANNEL_ID)
      || await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);

    if (!channel) {
      return interaction.editReply('❌ The log channel could not be found.');
    }

    const matches = [];
    let beforeId = undefined;

    try {
      while (matches.length < limit * 8 && matches.length < 200) {
        const fetched = beforeId
          ? await channel.messages.fetch({ limit: 100, before: beforeId })
          : await channel.messages.fetch({ limit: 100 });

        if (!fetched.size) break;

        const messages = [...fetched.values()].sort((a, b) => b.createdTimestamp - a.createdTimestamp);

        for (const message of messages) {
          if (!message.embeds?.length) continue;

          for (const embed of message.embeds) {
            const combined = [
              embed.title || '',
              embed.description || '',
              ...(embed.fields || []).map(field => `${field.name}\n${field.value}`),
            ].join('\n').toLowerCase();

            if (!combined.includes(searchTerm)) continue;

            const type = (embed.title || '').replace(/^📋\s*/, '').replace(/\s*Log$/, '') || 'Log';
            const reason = embed.fields?.find(field => field.name.toLowerCase() === 'reason')?.value || 'No reason provided';
            const moderator = embed.fields?.find(field => field.name.toLowerCase() === 'moderator')?.value || 'Unknown';

            matches.push({
              messageUrl: message.url,
              createdAt: message.createdAt,
              type,
              reason: String(reason).replace(/\*/g, '').slice(0, 200),
              moderator: String(moderator).replace(/\*/g, ''),
            });

            if (matches.length >= limit) break;
          }

          if (matches.length >= limit) break;
        }

        if (matches.length >= limit) break;

        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) break;
        beforeId = lastMessage.id;
      }
    } catch (error) {
      console.error('Log search error:', error);
      return interaction.editReply('❌ I could not search the log channel right now.');
    }

    if (!matches.length) {
      return interaction.editReply(`❌ No log history found for **${query}**.`);
    }

    const sortedMatches = matches.slice(0, limit).sort((a, b) => b.createdAt - a.createdAt);

    const embed = new EmbedBuilder()
      .setTitle(`🔎 Log History: ${query}`)
      .setDescription(`Found ${sortedMatches.length} matching log entry(s).`)
      .setColor(0x3CAAFF)
      .setTimestamp();

    for (const match of sortedMatches) {
      embed.addFields({
        name: `${match.type} • ${new Date(match.createdAt).toLocaleDateString()}`,
        value: `Reason: ${match.reason}\nModerator: ${match.moderator}\n[Jump to entry](${match.messageUrl})`,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
