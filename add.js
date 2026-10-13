const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a user to this ticket channel.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to add to this ticket.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const { channel, guild, member } = interaction;
    const target       = interaction.options.getUser('user');
    const targetMember = guild.members.cache.get(target.id);

    if (!channel.name.endsWith('-ticket')) {
      return interaction.reply({
        content: 'This command can only be used inside a ticket channel.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!targetMember) {
      return interaction.reply({
        content: 'Could not find that user in this server.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (channel.permissionOverwrites.cache.get(target.id)) {
      return interaction.reply({
        content: `<@${target.id}> already has access to this ticket.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await channel.permissionOverwrites.create(targetMember, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    const embed = new EmbedBuilder()
      .setColor('#242429')
      .setDescription(`<@${target.id}> has been added to this ticket by <@${member.id}>.`);

    await interaction.reply({ embeds: [embed] });
  },
};
