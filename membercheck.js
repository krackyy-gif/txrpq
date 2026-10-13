const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'membercheck',
  prefixes: ['!'],

  async execute(message, args, client) {
    if (!message.guild) return message.reply('Run this command in a server.');

    const serverKey = client.config.ERLC_SERVER_KEY;
    if (!serverKey) return message.reply('ER:LC server key is not configured.');

    const statusMessage = await message.reply('Checking the ER:LC player list...');

    try {
      const headers = { 'server-key': serverKey };
      const [serverResponse, staffResponse] = await Promise.all([
        axios.get('https://api.erlc.gg/v2/server?Players=true', {
          headers,
          timeout: 10000,
        }),
        axios.get('https://api.erlc.gg/v1/server/staff', {
          headers,
          timeout: 10000,
        }).catch(() => ({ data: [] })),
      ]);

      const players = Array.isArray(serverResponse.data.Players)
        ? serverResponse.data.Players
        : [];
      const staffList = Array.isArray(staffResponse.data) ? staffResponse.data : [];
      const staffIds = new Set(staffList.map(entry => {
        if (typeof entry === 'string') return entry.split(':')[1] || '';
        const rawPlayer = entry?.Player || '';
        return String(entry?.PlayerId || entry?.UserId || rawPlayer.split(':')[1] || '');
      }).filter(Boolean));

      const members = await message.guild.members.fetch();
      let inDiscord = 0;
      let notInVoice = 0;
      let staffInGame = 0;

      const lines = players.map(entry => {
        const rawPlayer = String(entry.Player || '');
        const [username = 'Unknown', userId = ''] = rawPlayer.split(':');
        const normalizedUsername = username.trim().toLowerCase();
        const member = members.find(candidate => [
          candidate.user.username,
          candidate.user.globalName,
          candidate.displayName,
        ].some(name => name?.trim().toLowerCase() === normalizedUsername));

        if (member) inDiscord += 1;

        const isStaff = staffIds.has(userId.trim()) || /staff|moderator|admin|owner/i.test(entry.Permission || '');
        if (isStaff) staffInGame += 1;

        let status = '❌ Not in Discord';
        if (member?.voice.channelId) {
          status = '✅ In VC';
        } else if (member) {
          status = '✅ Not in VC';
          notInVoice += 1;
        }

        const team = entry.Team ? ` — ${entry.Team}` : '';
        const callsign = entry.Callsign ? ` (${entry.Callsign})` : '';
        return `**${username.trim()}**${team}${callsign} — ${status}`;
      });

      const description = lines.length ? lines.join('\n') : 'No players are currently in the ER:LC server.';
      const embed = new EmbedBuilder()
        .setTitle('Texas State Roleplay | ER:LC Member Check')
        .setColor('#ff4655')
        .setDescription(description.slice(0, 4096))
        .addFields(
          { name: 'Player Count', value: String(players.length), inline: true },
          { name: 'In Discord', value: String(inDiscord), inline: true },
          { name: 'Not in Discord', value: String(players.length - inDiscord), inline: true },
          { name: 'Not in VC', value: String(notInVoice), inline: true },
          { name: 'Staff Members', value: String(staffInGame), inline: true },
        )
        .setFooter({ text: 'Discord matching uses exact usernames or server nicknames.' })
        .setTimestamp();

      if (lines.join('\n').length > 4096) {
        embed.setFooter({ text: `List truncated. Discord matching uses exact usernames or server nicknames.` });
      }

      await statusMessage.edit({ embeds: [embed], allowedMentions: { parse: [] } });
    } catch (error) {
      const status = error.response?.status;
      const text = status === 403
        ? 'ER:LC rejected the server key. Check the configured key.'
        : 'Could not fetch the ER:LC player list. Try again in a moment.';
      await statusMessage.edit(text);
    }
  },
};