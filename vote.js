const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const REQUIRED_VOTES = 7;
const VOTE_EMOJI     = '';
const VIEW_EMOJI     = '';
const HEADER_IMAGE   = '';
const FOOTER_IMAGE   = '';
const SERVER_NAME    = '';
const SERVER_OWNER   = '';
const JOIN_CODE      = '';
const QUICK_JOIN_URL = '';

const cooldowns = new Map();

module.exports = {
  customID: 'vote:button',

  async execute(interaction, client) {
    const sessionId  = interaction.customId.split('_')[1];
    const userId     = interaction.user.id;
    const now        = Date.now();
    const cooldownMs = 5000;

    if (cooldowns.has(userId)) {
      const expiresAt = cooldowns.get(userId);
      if (now < expiresAt) {
        return interaction.reply({ content: `You are on **cooldown**, please try again <t:${Math.floor(expiresAt / 1000)}:R>.`, flags: MessageFlags.Ephemeral });
      }
    }
    cooldowns.set(userId, now + cooldownMs);
    setTimeout(() => cooldowns.delete(userId), cooldownMs);

    if (!client.voteMap) client.voteMap = new Map();
    if (!client.voteMap.has(sessionId)) {
      client.voteMap.set(sessionId, new Map());
      client.activePollId = sessionId;
    }

    const sessionVotes = client.voteMap.get(sessionId);
    const hasVoted     = sessionVotes.has(userId);

    if (hasVoted) {
      sessionVotes.delete(userId);
    } else {
      sessionVotes.set(userId, { userId, timestamp: Date.now() });
    }

    const count   = sessionVotes.size;
    const voteBtn = new ButtonBuilder().setCustomId(`vote:button_${sessionId}`).setEmoji(VOTE_EMOJI || '✅').setStyle(ButtonStyle.Secondary);
    const viewBtn = new ButtonBuilder().setCustomId(`viewvote:button_${sessionId}`).setLabel(`View Voters (${count})`).setEmoji(VIEW_EMOJI || '👥').setStyle(ButtonStyle.Secondary);

    await interaction.update({ components: [new ActionRowBuilder().addComponents(voteBtn, viewBtn)] });
    await interaction.followUp({ content: hasVoted ? '✅ Removed your vote.' : '✅ Your vote was counted!', flags: MessageFlags.Ephemeral });

    if (sessionVotes.size === REQUIRED_VOTES) {
      const SESSION_ROLE_ID = client.config.SESSION_ROLE_ID || '';
      const votersArray     = [...sessionVotes.values()];
      const votersList      = votersArray.map(v => `<@${v.userId}>`).join(', ') || 'No Voters';

      const headerEmbed = new EmbedBuilder().setColor('#37373E').setImage(HEADER_IMAGE || null);
      const infoEmbed   = new EmbedBuilder()
        .setColor('#37373E')
        .setTitle('**Session Startup**')
        .setDescription(
          '> A server start-up has been initiated! Please ensure you have read and understood our regulations prior to joining.\n\n' +
          `**Game Information**\n> **Server Name**: ${SERVER_NAME}\n> **Server Owner**: ${SERVER_OWNER}\n> **Join Code**: ${JOIN_CODE}\n\n`
        )
        .setImage(FOOTER_IMAGE || null);

      const startBtn = new ButtonBuilder().setLabel('Quick Join').setURL(QUICK_JOIN_URL || 'https://policeroleplay.community').setStyle(ButtonStyle.Link);
      await interaction.channel.send({
        content: `${SESSION_ROLE_ID ? `<@&${SESSION_ROLE_ID}>` : ''}\n-# ${votersList}`,
        embeds: [headerEmbed, infoEmbed],
        components: [new ActionRowBuilder().addComponents(startBtn)],
      });

      await interaction.message.delete().catch(() => {});

      for (const v of votersArray) {
        const member   = interaction.guild?.members.cache.get(v.userId) || await interaction.guild?.members.fetch(v.userId).catch(() => null);
        const userToDM = member?.user || await interaction.client.users.fetch(v.userId).catch(() => null);
        if (!userToDM) continue;
        const dmEmbed = new EmbedBuilder().setColor('#37373E').setDescription(`Hey <@${v.userId}>, thank you for voting. The session has now started — please join the game to avoid getting moderated!`);
        const dmBtn   = new ButtonBuilder().setLabel('Quick Join').setURL(QUICK_JOIN_URL || 'https://policeroleplay.community').setStyle(ButtonStyle.Link);
        await userToDM.send({ embeds: [dmEmbed], components: [new ActionRowBuilder().addComponents(dmBtn)] }).catch(() => {});
      }

      client.voteMap.delete(sessionId);
    }
  },
};
