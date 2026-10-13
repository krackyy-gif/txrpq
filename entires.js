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
  customID: 'entries',

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    let giveaway;
    try {
      giveaway = await Giveaway.findOne({ messageId: interaction.message.id });
    } catch {
      return interaction.editReply({ content: '❌ Database is currently unavailable.' });
    }

    if (!giveaway) return interaction.editReply({ content: '❌ Giveaway not found.' });

    if (!giveaway.participants.length) {
      return interaction.editReply({ content: 'There are currently **no entries** for this giveaway.' });
    }

    return renderPage(interaction, giveaway, 0);
  },
};

async function renderPage(interaction, giveaway, page) {
  const perPage  = 20;
  const mentions = giveaway.participants.map(id => `<@${id}>`);
  const maxPage  = Math.ceil(mentions.length / perPage) - 1;
  const chunk    = mentions.slice(page * perPage, page * perPage + perPage);

  const container = new ContainerBuilder()
    .setAccentColor(0x242429)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(chunk.join('\n')))
    .addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`entries_prev:${page}`).setLabel('Back').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`entries_next:${page}`).setLabel('Next').setStyle(ButtonStyle.Secondary).setDisabled(page >= maxPage),
      )
    );

  return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

module.exports.renderPage = renderPage;
