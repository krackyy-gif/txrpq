const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const Giveaway = require('../../models/giveawaySchema');

module.exports = {
  customId: 'entries_next',

  async execute(interaction) {
    const [, page] = interaction.customId.split(':');
    let currentPage = Number(page) + 1;

    const giveaway = await Giveaway.findOne({ messageId: interaction.message.id });
    if (!giveaway) return interaction.reply({ content: 'Giveaway not found.', ephemeral: true });

    const participantsPerPage = 20;
    const participants = giveaway.participants.map(id => `<@${id}>`);

    const pages = [];
    for (let i = 0; i < participants.length; i += participantsPerPage) {
      const container = new ContainerBuilder().setAccentColor(0x242429);
      const chunk = participants.slice(i, i + participantsPerPage);

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(chunk.join('\n'))
      );

      container.addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large));

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`entries_prev:${i / participantsPerPage}`)
          .setLabel('Back')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(i === 0),
        new ButtonBuilder()
          .setCustomId(`entries_next:${i / participantsPerPage}`)
          .setLabel('Next')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(i + participantsPerPage >= participants.length),
      );

      container.addActionRowComponents(row);
      pages.push(container);
    }

    await interaction.update({
      components: [pages[currentPage]],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
