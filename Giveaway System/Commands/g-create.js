const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require('discord.js');

const Giveaway = require('../models/giveawaySchema');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-create')
    .setDescription('Create a new giveaway')
    .addStringOption(option =>
      option
        .setName('prize')
        .setDescription('The prize of the giveaway')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('duration')
        .setDescription('Duration (e.g. 1h, 30m, 2d)')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('winners')
        .setDescription('Number of winners')
        .setRequired(true)
    ),

  async execute(interaction) {
    const requiredRoleId = ''; // input role here

    if (!interaction.member.roles.cache.has(requiredRoleId)) {
      return interaction.reply({
        content: `You don't have permission to use this command.`,
        ephemeral: true
      });
    }

    const prize = interaction.options.getString('prize');
    const duration = interaction.options.getString('duration');
    const winnersCount = interaction.options.getInteger('winners');

    const durationMs = ms(duration);

    if (!durationMs || durationMs < 10000) {
      return interaction.reply({
        content: 'Invalid duration format or too short!',
        flags: MessageFlags.Ephemeral
      });
    }

    const endTime = new Date(Date.now() + durationMs);
    const endTimestamp = Math.floor(endTime.getTime() / 1000);

    const container = new ContainerBuilder()
      .setAccentColor(0x242429);

    const text = new TextDisplayBuilder()
      .setContent(
        `**Prize:** ${prize}\n` +
        `**Ends:** <t:${endTimestamp}:R>\n` +
        `**Winners:** **${winnersCount}**`
      );

    container.addTextDisplayComponents(text);

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
          .setLabel('0')
          .setEmoji('') // put emoji here or delete line
          .setStyle(ButtonStyle.Secondary)
      )
    );

    const message = await interaction.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    await Giveaway.create({
      messageId: message.id,
      channelId: message.channel.id,
      guildId: message.guild.id,
      prize,
      winnersCount,
      endTime,
      participants: [],
      ended: false
    });

    await interaction.reply({
      content: 'This giveaway is created successfully!',
      flags: MessageFlags.Ephemeral
    });
  }
};
