const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { getRobloxInfo } = require('../utils/docksystem');

const STAFF_ROLE_IDS = [
  '1554727846339940450',
  '1554727846339940449',
  '1554727846339940448',
  '1554727846339940448',
  '1554733376429228032',
  '1554727846339940447',
  '1554727846339940446',
  '1554727846339940445',
  '1554727846339940444',
  '1554727846339940442',
  '1554727846302453872',
  '1554727846302453870',
  '1554727846302453867',
  '1554727846302453866',
  '1554727846302453864',
  '1554727846302453863',
  '1554727846277029956',
  '1554727846277029954',
  '1554727846277029953',
  '1554727846130356289',
  '1554727846130356289',
  '1554727846130356288',
  '1554727846130356286',
  '1554727846130356284',
  '1554727846059180042',
  '1554727846059180041',
  '1554727846059180040',
  '1554727846059180035',
  '1554727846059180035',
  '1554727846059180036',
  '1554727846059180034',
  '1556995813257904218',
  '1556995841330511882',
  '1554737886434164746',
];

async function runErlcCommand(client, command) {
  const serverKey = client.config?.ERLC_SERVER_KEY;
  if (!serverKey) {
    return { ok: false, reason: 'ER:LC server key is not configured.' };
  }

  try {
    await axios.post(
      'https://api.erlc.gg/v1/server/command',
      { command },
      { headers: { 'server-key': serverKey, 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err.response?.status === 403
        ? 'Invalid ER:LC server key.'
        : err.response?.data?.message || 'ER:LC command failed.',
    };
  }
}

module.exports = {
  name: 'takeperms',
  prefixes: ['!','$'],

  async execute(message, args, client) {
    const targetMember = message.mentions.members?.first()
      || message.guild?.members.cache.get(args[0])
      || message.guild?.members.fetch(args[0]).catch(() => null);

    if (!targetMember) {
      return message.reply('❌ Usage: `$takeperms @user`');
    }

    const uniqueRoleIds = [...new Set(STAFF_ROLE_IDS.map(String))];
    const removedRoles = [];

    for (const roleId of uniqueRoleIds) {
      if (targetMember.roles.cache.has(roleId)) {
        await targetMember.roles.remove(roleId).catch(() => {});
        removedRoles.push(roleId);
      }
    }

    let robloxUsername = null;
    let erlResult = { ok: false, reason: 'No linked Roblox account found.' };

    const dockData = await getRobloxInfo(targetMember.id, message, client);
    if (!dockData?.error && dockData?.username) {
      robloxUsername = dockData.username;
      const unadmin = await runErlcCommand(client, `:unadmin ${robloxUsername}`);
      const unmod = await runErlcCommand(client, `:unmod ${robloxUsername}`);

      erlResult = {
        ok: unadmin.ok || unmod.ok,
        reason: unadmin.ok && unmod.ok
          ? 'ER:LC in-game permissions removed.'
          : [unadmin.reason, unmod.reason].filter(Boolean).join(' | '),
        username: robloxUsername,
      };
    }

    const embed = new EmbedBuilder()
      .setTitle('🔧 Staff Permissions Removed')
      .setColor(removedRoles.length || erlResult.ok ? 0xF59E0B : 0x4B5563)
      .setDescription(
        robloxUsername
          ? `✅ Ran :unadmin ${robloxUsername} :unmod ${robloxUsername}\n` +
            `Discord roles removed: **${removedRoles.length || 0}**\n` +
            `ER:LC status: **${erlResult.ok ? 'Removed' : 'Failed'}**`
          : `✅ Ran :unadmin ${targetMember} :unmod ${targetMember}\n` +
            `Discord roles removed: **${removedRoles.length || 0}**\n` +
            `ER:LC status: **No linked Roblox account**`
      )
      .addFields(
        { name: 'User', value: `${targetMember}`, inline: true },
        { name: 'Discord Roles', value: String(removedRoles.length || 0), inline: true },
        { name: 'ER:LC', value: robloxUsername ? (erlResult.ok ? '✅ Removed' : '⚠️ Failed') : 'N/A', inline: true },
      )
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};
