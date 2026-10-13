const cron = require('node-cron');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const Giveaway = require('../models/giveawaySchema');

module.exports = (client) => {
  cron.schedule('*/30 * * * * *', async () => { // 30 seconds is best for rate limits
    try {
      const now = new Date();

      const activeGiveaways = await Giveaway.find({
        ended: false,
        endTime: { $lte: now },
      });

      for (const giveaway of activeGiveaways) {
        const guild = await client.guilds.fetch(giveaway.guildId).catch(() => null);
        if (!guild) continue;

        const channel = await guild.channels.fetch(giveaway.channelId).catch(() => null);
        if (!channel) continue;

        const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
        if (!message) continue;

        const container = new ContainerBuilder().setAccentColor(0x242429);

        const mainText = new TextDisplayBuilder().setContent(
          `**Prize:** ${giveaway.prize}\n` +
          `**Ended:** <t:${Math.floor(now.getTime() / 1000)}:R>\n` +
          `**Winners:** **${giveaway.winnersCount}**`
        );

        container.addTextDisplayComponents(mainText);

        container.addSeparatorComponents(separator =>
          separator.setSpacing(SeparatorSpacingSize.Large)
        );

        container.addActionRowComponents(row =>
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('join')
            .setEmoji('') // put emoji here or delete line
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),

          new ButtonBuilder()
            .setCustomId('entries')
            .setLabel(`${giveaway.participants.length}`)
            .setEmoji('') // put emoji here or delete line
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        )
      );

        await message.edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        if (!giveaway.participants.length) {
          await message.reply('Giveaway ended, but no one participated.');
          giveaway.ended = true;
          await giveaway.save();
          continue;
        }

        const pool = [...giveaway.participants];
        const winners = [];

        for (let i = 0; i < giveaway.winnersCount && pool.length > 0; i++) {
          const index = Math.floor(Math.random() * pool.length);
          winners.push(pool.splice(index, 1)[0]);
        }

        const winnerMentions = winners.map(id => `<@${id}>`).join(', ');

        await message.reply(
          `Congratulations ${winnerMentions} — you won **${giveaway.prize}**!`
        );

        giveaway.ended = true;
        await giveaway.save();
      }
    } catch (err) {
      console.error('Error checking giveaways:', err);
    }
  });
};
