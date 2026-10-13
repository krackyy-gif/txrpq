const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  name: 'join',
  prefixes: ['!','$'],

  async execute(message, args, client) {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return message.reply('❌ You need to be in a voice channel first.');
    }

    const botMember = message.guild.members.me || await message.guild.members.fetch(client.user.id).catch(() => null);
    const botPerms = botMember ? voiceChannel.permissionsFor(botMember) : null;
    if (!botPerms || !botPerms.has(['Connect', 'Speak'])) {
      return message.reply('❌ I need **Connect** and **Speak** permissions in that voice channel.');
    }

    client.music = client.music || new Map();

    const existing = client.music.get(message.guild.id);
    if (existing?.connection && !existing.connection.destroyed) {
      return message.reply(`✅ Already connected to **${existing.connection.joinConfig.channelId ? 'the voice channel' : 'the voice channel'}**.`);
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: true,
    });

    client.music.set(message.guild.id, {
      connection,
      player: null,
      queue: [],
      playing: false,
    });

    return message.reply(`✅ Joined **${voiceChannel.name}**.`);
  },
};
