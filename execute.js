const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { hasPerm } = require('../utils/staffHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('execute')
    .setDescription('Execute an ER:LC server command.')
    .addStringOption(o =>
      o.setName('command').setDescription('Command to run (e.g. :h Hello)').setRequired(true)
    ),

  async execute(interaction, client) {
    if (!hasPerm(interaction)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
    }

    return interaction.reply({
      content: 'ER:LC commands must be entered in-game. They cannot be executed through Discord.',
      flags: MessageFlags.Ephemeral,
    });
  },
};
