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
  customId: 'entries',

  async execute(interaction) {
    const giveaway = await Giveaway.findOne({ messageId: interaction.message.id });
    if (!giveaway) {
      return interaction.reply({ content: 'Giveaway not found.', ephemeral: true });
    }

    if (!giveaway.participants.length) {
      const container = new ContainerBuilder()
        .setAccentColor(0x242429)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('There are currently **no entries** for this giveaway.')
        )
        .addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large));

      return interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }

    return renderPage(interaction, giveaway, 0, true);
  },
};

function renderPage(interaction, giveaway, page, reply = false) {
  const participantsPerPage = 20;
  const participants = giveaway.participants.map(id => `<@${id}>`);
  const maxPage = Math.ceil(participants.length / participantsPerPage) - 1;

  const start = page * participantsPerPage;
  const chunk = participants.slice(start, start + participantsPerPage);

  const container = new ContainerBuilder().setAccentColor(0x242429);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(chunk.join('\n'))
  );

  container.addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`entries_prev:${page}`)
      .setLabel('Back')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId(`entries_next:${page}`)
      .setLabel('Next')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= maxPage),
  );

  container.addActionRowComponents(row);

  const payload = {
    components: [container],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  };

  return reply ? interaction.reply(payload) : interaction.update(payload);
}
