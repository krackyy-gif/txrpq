const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const crypto = require('crypto');
const { hasPerm } = require('../utils/staffHelpers');

const SERVER_NAME         = '';
const SERVER_OWNER        = '';
const JOIN_CODE           = '';
const HEADER_IMAGE        = '';
const FOOTER_IMAGE        = '';
const QUICK_JOIN_URL      = '';
const VOTE_EMOJI          = '<:Check:1429634017879130272>';
const VIEW_VOTERS_EMOJI   = '<:directed:1429912362109898913>';
const SESSIONS_ROLE_EMOJI = '';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('session')
    .setDescription('Session management.')
    .addSubcommand(sub => sub
      .setName('startup')
      .setDescription('Host a session start up.')
    )
    .addSubcommand(sub => sub
      .setName('shutdown')
      .setDescription('Host a session shutdown.')
    )
    .addSubcommand(sub => sub
      .setName('vote')
      .setDescription('Host a session vote.')
    )
    .addSubcommand(sub => sub
      .setName('boost')
      .setDescription('Send a session boost ping.')
    )
    .addSubcommand(sub => sub
      .setName('full')
      .setDescription('Send the session full embed.')
    ),

  async execute(interaction, client) {
    if (!hasPerm(interaction)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
    }

    const sub = interaction.options.getSubcommand();
    const cfg = interaction.client.config;
    const SESSION_CHANNEL_ID   = cfg.SESSION_CHANNEL_ID;
    const SESSION_ROLE_ID      = cfg.SESSION_ROLE_ID;
    const NOTIFICATION_ROLE_ID = cfg.NOTIFICATION_ROLE_ID;

    const getChannel = async () => SESSION_CHANNEL_ID
      ? await interaction.guild.channels.fetch(SESSION_CHANNEL_ID).catch(() => interaction.channel)
      : interaction.channel;

    const makeEmbeds = (mainEmbed) => HEADER_IMAGE
      ? [new EmbedBuilder().setColor('#37373E').setImage(HEADER_IMAGE), mainEmbed]
      : [mainEmbed];

    if (sub === 'startup') {
      if (!client.voteMap) client.voteMap = new Map();
      const voters     = client.activePollId ? client.voteMap.get(client.activePollId) : null;
      const votersList = voters && voters.size > 0
        ? [...voters.values()].map(v => `<@${v.userId}>`).join(', ')
        : '**No voters!**';

      const embed = new EmbedBuilder()
        .setColor('#37373E')
        .setTitle('**Session Startup**')
        .setDescription(
          '> A server start-up has been initiated! Please ensure you have read and understood our regulations prior to joining.\n\n' +
          '**Game Information**\n' +
          `> **Server Name**: ${SERVER_NAME}\n` +
          `> **Server Owner**: ${SERVER_OWNER}\n` +
          `> **Join Code**: ${JOIN_CODE}\n\n`
        );
      if (FOOTER_IMAGE) embed.setImage(FOOTER_IMAGE);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Quick Join').setURL(QUICK_JOIN_URL || 'https://policeroleplay.community').setStyle(ButtonStyle.Link)
      );

      const channel = await getChannel();
      await channel.send({
        content: `${SESSION_ROLE_ID ? `<@&${SESSION_ROLE_ID}>` : ''}\n-# ${votersList}`,
        embeds: makeEmbeds(embed),
        components: [row],
      });

      return interaction.reply({ content: '✅ Successfully hosted a session start up.', flags: MessageFlags.Ephemeral });
    }

    if (sub === 'shutdown') {
      const embed = new EmbedBuilder()
        .setColor('#37373E')
        .setTitle('Session Shutdown')
        .setDescription(
          `> The in-game server is currently on shutdown. Please refrain from attempting to join during this time. ` +
          `Be sure to obtain the ${NOTIFICATION_ROLE_ID ? `<@&${NOTIFICATION_ROLE_ID}>` : 'sessions'} role to be notified for the next session!`
        );
      if (FOOTER_IMAGE) embed.setImage(FOOTER_IMAGE);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('sessionsRole:button')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(SESSIONS_ROLE_EMOJI || '🔔')
      );

      const channel = await getChannel();
      await channel.send({ embeds: makeEmbeds(embed), components: [row] });
      return interaction.reply({ content: '✅ Successfully hosted a session shutdown.', flags: MessageFlags.Ephemeral });
    }

    if (sub === 'vote') {
      const pollSessionId = crypto.randomBytes(6).toString('hex');

      const embed = new EmbedBuilder()
        .setColor('#37373E')
        .setTitle('Session Vote')
        .setDescription('> Please cast your vote below for the upcoming session. If you vote, you are committing to join. Failure to participate after voting will result in moderation.');
      if (FOOTER_IMAGE) embed.setImage(FOOTER_IMAGE);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`vote:button_${pollSessionId}`).setEmoji(VOTE_EMOJI).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`viewvote:button_${pollSessionId}`).setLabel('View Voters').setEmoji(VIEW_VOTERS_EMOJI).setStyle(ButtonStyle.Secondary),
      );

      const channel = SESSION_CHANNEL_ID
        ? await client.channels.fetch(SESSION_CHANNEL_ID).catch(() => interaction.channel)
        : interaction.channel;

      await channel.send({
        content: SESSION_ROLE_ID ? `<@&${SESSION_ROLE_ID}>` : '@here',
        embeds: makeEmbeds(embed),
        components: [row],
      });

      return interaction.reply({ content: '✅ Successfully hosted a session vote.', flags: MessageFlags.Ephemeral });
    }

    if (sub === 'boost') {
      const embed = new EmbedBuilder()
        .setColor('#37373E')
        .setTitle('Session Boost')
        .setDescription('> The in-game server count is currently **low**. Join up to skip the queue and participate in some amazing roleplays!');
      if (FOOTER_IMAGE) embed.setImage(FOOTER_IMAGE);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Quick Join').setURL(QUICK_JOIN_URL || 'https://policeroleplay.community').setStyle(ButtonStyle.Link)
      );

      const channel = SESSION_CHANNEL_ID
        ? await client.channels.fetch(SESSION_CHANNEL_ID).catch(() => interaction.channel)
        : interaction.channel;

      await channel.send({
        content: SESSION_ROLE_ID ? `<@&${SESSION_ROLE_ID}>` : '@here',
        embeds: makeEmbeds(embed),
        components: [row],
      });

      return interaction.reply({ content: '✅ Successfully sent session boost!', flags: MessageFlags.Ephemeral });
    }

    if (sub === 'full') {
      const timestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`;

      const embed = new EmbedBuilder()
        .setColor('#37373E')
        .setTitle('Session Full')
        .setDescription(`> The session has been full since **${timestamp}**. Keep trying to join us for some amazing roleplays!`);
      if (FOOTER_IMAGE) embed.setImage(FOOTER_IMAGE);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Quick Join').setURL(QUICK_JOIN_URL || 'https://policeroleplay.community').setStyle(ButtonStyle.Link)
      );

      const channel = SESSION_CHANNEL_ID
        ? await client.channels.fetch(SESSION_CHANNEL_ID).catch(() => interaction.channel)
        : interaction.channel;

      await channel.send({ embeds: makeEmbeds(embed), components: [row] });
      return interaction.reply({ content: '✅ Successfully marked the session as full!', flags: MessageFlags.Ephemeral });
    }
  },
};
