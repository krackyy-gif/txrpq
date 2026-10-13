module.exports = {
  customId: 'entries_prev',

  async execute(interaction) {
    const [, page] = interaction.customId.split(':');
    interaction.customId = `entries_next:${Number(page) - 1}`;
    return require('./entries_next').execute(interaction);
  },
};
