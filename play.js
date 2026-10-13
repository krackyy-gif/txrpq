const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel, getVoiceConnection, StreamType } = require('@discordjs/voice');
const playdl = require('play-dl');
const ffmpegPath = require('ffmpeg-static');

process.env.FFMPEG_PATH = ffmpegPath || process.env.FFMPEG_PATH;

async function resolveTrack(query) {
  const cleanQuery = String(query || '').trim();

  if (!cleanQuery) {
    throw new Error('No song query provided.');
  }

  if (/^https?:\/\//i.test(cleanQuery)) {
    return {
      title: cleanQuery,
      url: cleanQuery,
    };
  }

  const search = await playdl.search(cleanQuery, { limit: 3 });
  const video = search?.find(item => item && (item.url || item.id));

  if (!video) {
    throw new Error('No results found for that song.');
  }

  const url = video.url || `https://www.youtube.com/watch?v=${video.id}`;

  return {
    title: video.title || cleanQuery,
    url,
  };
}

function getGuildMusic(client, guildId, connection) {
  client.music = client.music || new Map();

  if (!client.music.has(guildId)) {
    client.music.set(guildId, { connection, player: null, queue: [], playing: false, currentTitle: null });
  }

  const state = client.music.get(guildId);
  state.connection = connection;
  return state;
}

module.exports = {
  name: 'play',
  prefixes: ['!','$'],

  async execute(message, args, client) {
    if (!args.length) {
      return message.reply('❌ Usage: $play <song name or YouTube link>');
    }

    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return message.reply('❌ You need to be in a voice channel first.');
    }

    const query = args.join(' ');

    try {
      const track = await resolveTrack(query);

      let connection = getVoiceConnection(message.guild.id);
      if (!connection) {
        connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
          selfDeaf: true,
        });
      }

      const guildMusic = getGuildMusic(client, message.guild.id, connection);
      guildMusic.queue.push(track);

      if (guildMusic.playing) {
        return message.reply(`🎵 Added to queue: **${track.title}**`);
      }

      guildMusic.playing = true;
      const player = guildMusic.player || createAudioPlayer({
        behaviors: { noSubscriber: 'pause' },
      });
      guildMusic.player = player;

      const playNext = async () => {
        const nextTrack = guildMusic.queue.shift();
        if (!nextTrack) {
          guildMusic.playing = false;
          guildMusic.currentTitle = null;
          return;
        }

        if (!nextTrack.url || typeof nextTrack.url !== 'string') {
          throw new Error('No playable URL for this track.');
        }

        guildMusic.currentTitle = nextTrack.title;
        const stream = await playdl.stream(nextTrack.url, { quality: 2, discordPlayerCompatibility: true });
        if (!stream || !stream.stream) {
          throw new Error('Stream unavailable for this track.');
        }

        const resource = createAudioResource(stream.stream, {
          inputType: stream.type === 'opus' ? StreamType.Opus : StreamType.Arbitrary,
        });

        player.play(resource);
      };

      if (!player.listeners('stateChange').length) {
        player.on('stateChange', async (oldState, newState) => {
          if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
            await playNext();
          }
        });
      }

      if (!connection.state.subscription || !connection.state.subscription.player) {
        connection.subscribe(player);
      }

      guildMusic.currentTitle = track.title;
      await playNext();
      return message.reply(`🎵 Now playing: **${guildMusic.currentTitle || track.title}**`);
    } catch (error) {
      console.error('[PLAY]', error);
      return message.reply('❌ I could not find or play that song.');
    }
  },
};
