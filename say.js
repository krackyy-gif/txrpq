const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Makes the bot send a message in this channel.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message you want the bot to say.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const REQUIRED_ROLE_ID = interaction.client.config.SAY_REQUIRED_ROLE_ID;

    if (REQUIRED_ROLE_ID) {
      if (!interaction.guild.roles.cache.has(REQUIRED_ROLE_ID)) {
        return interaction.reply({
          content: 'The role configured for this command is invalid.',
          flags: MessageFlags.Ephemeral,
        });
      }

      if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
        return interaction.reply({
          content: '❌ You do not have permission to use this command.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    const message = interaction.options.getString('message');
    await interaction.reply({ content: 'Your message has been sent!', flags: MessageFlags.Ephemeral });
    await interaction.channel.send({ content: message });
  },
};
