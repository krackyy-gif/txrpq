const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const Giveaway = require('../models/giveawaySchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-end')
    .setDescription('End a giveaway manually')
    .addStringOption(option =>
      option
        .setName('messageid')
        .setDescription('The message ID of the giveaway')
        .setRequired(true)
    ),

  async execute(interaction) {
    const requiredRoleId = ''; // input role here

    if (!interaction.member.roles.cache.has(requiredRoleId)) {
      return interaction.reply({
        content: `You don't have permission to use this command.`,
        ephemeral: true,
      });
    }

    const messageId = interaction.options.getString('messageid');
    const giveaway = await Giveaway.findOne({ messageId });

    if (!giveaway) {
      return interaction.reply({ content: 'Giveaway not found.', ephemeral: true });
    }

    if (giveaway.ended) {
      return interaction.reply({ content: 'This giveaway has already ended.', ephemeral: true });
    }

    const channel = await interaction.guild.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });

    const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
    if (!message) return interaction.reply({ content: 'Message not found.', ephemeral: true });

    const now = new Date();

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
      return interaction.reply({
        content: 'Giveaway ended — but there were no participants.',
        ephemeral: true,
      });
    }

    const winners = [];
    const pool = [...giveaway.participants];

    for (let i = 0; i < giveaway.winnersCount && pool.length > 0; i++) {
      const winnerIndex = Math.floor(Math.random() * pool.length);
      winners.push(pool.splice(winnerIndex, 1)[0]);
    }

    const winnerMentions = winners.map(w => `<@${w}>`).join(', ');

    await message.reply(
      `Congratulations ${winnerMentions} — you won **${giveaway.prize}**!`
    );

    giveaway.ended = true;
    await giveaway.save();

    interaction.reply({
      content: 'Giveaway ended and winners announced successfully!',
      ephemeral: true,
    });
  },
};
