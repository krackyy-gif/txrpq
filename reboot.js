const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { isSuperuser } = require('../utils/staffHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reboot')
    .setDescription('Restart the bot. (Superusers only)'),

  async execute(interaction) {
    if (!isSuperuser(interaction.user.id, interaction.client.config)) {
      return interaction.reply({
        content: '❌ Only superusers can use this command.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.reply({
      content: '🔄 Restarting bot...',
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  },
};
