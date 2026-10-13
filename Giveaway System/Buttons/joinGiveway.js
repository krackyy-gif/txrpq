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

module.exports = {
  customID: 'join',

  async execute(interaction) {
    const giveaway = await Giveaway.findOne({ messageId: interaction.message.id });
    if (!giveaway) {
      return interaction.reply({ content: 'Giveaway not found.', ephemeral: true });
    }

    if (giveaway.ended) {
      return interaction.reply({ content: 'This giveaway has already ended.', ephemeral: true });
    }

    const userId = interaction.user.id;
    const hasJoined = giveaway.participants.includes(userId);

    if (hasJoined) {
      giveaway.participants = giveaway.participants.filter(id => id !== userId);
      await giveaway.save();
      await interaction.reply({ content: 'You left the giveaway.', ephemeral: true });
    } else {
      giveaway.participants.push(userId);
      await giveaway.save();
      await interaction.reply({ content: 'You joined the giveaway!', ephemeral: true });
    }

    try {
      const message = await interaction.channel.messages.fetch(giveaway.messageId);

      const container = new ContainerBuilder().setAccentColor(0x242429);

      const mainText = new TextDisplayBuilder().setContent(
        `**Prize:** ${giveaway.prize}\n` +
        `**Ends:** <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>\n` +
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
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId('entries')
            .setLabel(`${giveaway.participants.length}`)
            .setEmoji('') // put emoji here or delete line
            .setStyle(ButtonStyle.Secondary)
        )
      );

      await message.edit({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (err) {
      console.error('Failed to update join button label:', err);
    }
  },
};
