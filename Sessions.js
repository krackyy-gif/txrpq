const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const SessionsModel = require('../models/sessionsModel');

const SESSION_CHANNEL_ID    = ''; // channel id to send the panel
const NOTIFICATION_ROLE_ID  = ''; // notification role id
const STAFF_ROLE_ID         = ''; // staff role id for moderating count
const WEEKDAY_TIME          = ''; // weekday timestamp
const WEEKEND_TIME          = ''; // weekend timestamp
const HEADER_IMAGE          = ''; // header image url
const FOOTER_IMAGE          = ''; // footer image url
const BELL_EMOJI            = ''; // emoji for the bell/role button

module.exports = {
  name: 'sessions',

  async execute(message, args, client) {
    const { PermissionFlagsBits } = require('discord.js');
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.react('❌').catch(() => {});
    }

    const serverKey  = client.config.ERLC_SERVER_KEY;
    const apiBase    = 'https://api.erlc.gg/v1';

    const [playersRes, queueRes] = await Promise.allSettled([
      serverKey ? axios.get(`${apiBase}/server/players`, { headers: { 'Server-Key': serverKey } }) : Promise.reject(),
      serverKey ? axios.get(`${apiBase}/server/queue`,   { headers: { 'Server-Key': serverKey } }) : Promise.reject(),
    ]);

    const players = playersRes.status === 'fulfilled' ? playersRes.value.data : [];
    const queue   = queueRes.status   === 'fulfilled' ? queueRes.value.data   : [];

    if (STAFF_ROLE_ID) await message.guild.members.fetch().catch(() => {});
    const moderatingCount = STAFF_ROLE_ID
      ? message.guild.members.cache.filter(m => m.roles.cache.has(STAFF_ROLE_ID)).size
      : 0;

    const now = Math.floor(Date.now() / 1000);

    const headerEmbed = new EmbedBuilder().setColor('#37373E').setImage(HEADER_IMAGE);

    const infoEmbed = new EmbedBuilder()
      .setColor('#37373E')
      .setDescription(
        `> You will be notified here when a staff member initiates a session.\n\n` +
        `> Ensure you have the ${NOTIFICATION_ROLE_ID ? `<@&${NOTIFICATION_ROLE_ID}>` : 'sessions'} role to be notified when a session occurs.` +
        (WEEKDAY_TIME ? ` Our sessions typically occur around <t:${WEEKDAY_TIME}:t> on weekdays` : '') +
        (WEEKEND_TIME ? ` and <t:${WEEKEND_TIME}:t> on weekends.` : '.')
      )
      .setImage(FOOTER_IMAGE);

    const statusEmbed = new EmbedBuilder()
      .setColor('#37373E')
      .setTitle('` ⛰️ ` Session Status')
      .setDescription(`**Last Updated:** <t:${now}:R>`)
      .addFields(
        { name: 'Players',    value: `\`\`\`\n${Array.isArray(players) ? players.length : 0}\n\`\`\``, inline: true },
        { name: 'Moderating', value: `\`\`\`\n${moderatingCount}\n\`\`\``,                             inline: true },
        { name: 'Queue',      value: `\`\`\`\n${Array.isArray(queue) ? queue.length : 0}\n\`\`\``,    inline: true },
      )
      .setImage(FOOTER_IMAGE);

    const statusBtn = new ButtonBuilder()
      .setCustomId('status:noop')
      .setLabel(Array.isArray(players) && players.length >= 1 ? 'Server Online' : 'Server Offline')
      .setStyle(Array.isArray(players) && players.length >= 1 ? ButtonStyle.Success : ButtonStyle.Danger)
      .setDisabled(true);

    const bellBtn = new ButtonBuilder()
      .setCustomId('sessionsRole:button')
      .setEmoji(BELL_EMOJI || '🔔')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(statusBtn, bellBtn);

    const channel = SESSION_CHANNEL_ID
      ? await message.guild.channels.fetch(SESSION_CHANNEL_ID).catch(() => message.channel)
      : message.channel;

    const reply = await channel.send({ embeds: [headerEmbed, infoEmbed, statusEmbed], components: [row] });

    await SessionsModel.deleteMany();
    await new SessionsModel({ channelId: reply.channel.id, messageId: reply.id }).save();
    await message.react('✅').catch(() => {});

    const interval = setInterval(async () => {
      try {
        const [pU, qU] = await Promise.allSettled([
          serverKey ? axios.get(`${apiBase}/server/players`, { headers: { 'Server-Key': serverKey } }) : Promise.reject(),
          serverKey ? axios.get(`${apiBase}/server/queue`,   { headers: { 'Server-Key': serverKey } }) : Promise.reject(),
        ]);
        const playersU = pU.status === 'fulfilled' ? pU.value.data : [];
        const queueU   = qU.status === 'fulfilled' ? qU.value.data : [];

        const updatedEmbed = new EmbedBuilder()
          .setColor('#37373E')
          .setTitle('` ⛰️ ` Session Status')
          .setDescription(`**Last Updated:** <t:${Math.floor(Date.now() / 1000)}:R>`)
          .addFields(
            { name: 'Players',    value: `\`\`\`\n${Array.isArray(playersU) ? playersU.length : 0}\n\`\`\``, inline: true },
            { name: 'Moderating', value: `\`\`\`\n${moderatingCount}\n\`\`\``,                               inline: true },
            { name: 'Queue',      value: `\`\`\`\n${Array.isArray(queueU) ? queueU.length : 0}\n\`\`\``,    inline: true },
          )
          .setImage(FOOTER_IMAGE);

        const statusBtnU = new ButtonBuilder()
          .setCustomId('status:noop')
          .setLabel(Array.isArray(playersU) && playersU.length >= 1 ? 'Server Online' : 'Server Offline')
          .setStyle(Array.isArray(playersU) && playersU.length >= 1 ? ButtonStyle.Success : ButtonStyle.Danger)
          .setDisabled(true);

        const rowU = new ActionRowBuilder().addComponents(statusBtnU, new ButtonBuilder().setCustomId('sessionsRole:button').setEmoji(BELL_EMOJI || '🔔').setStyle(ButtonStyle.Secondary));
        await reply.edit({ embeds: [headerEmbed, infoEmbed, updatedEmbed], components: [rowU] });
      } catch (err) {
        if (err.code === 10008) { clearInterval(interval); return; }
        console.warn('[sessions] update error:', err.message);
      }
    }, 60 * 1000);
  },
};
