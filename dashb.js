const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SeparatorBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
} = require('discord.js');

module.exports = {
  name: 'dashb',
  prefixes: ['$'],

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('You need administrator permissions to post the dashboard.');
    }

    const regulationsMenu = new StringSelectMenuBuilder()
      .setCustomId('dashboard:regulations')
      .setPlaceholder('Regulations')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Discord Regulations')
          .setDescription('Our Discord Rules.')
          .setEmoji('📘')
          .setValue('discord'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Game Regulations')
          .setDescription('Our Game Rules.')
          .setEmoji('🎮')
          .setValue('game'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Banned Roleplay')
          .setDescription('Our server banned roleplays.')
          .setEmoji('❌')
          .setValue('banned-roleplay'),
      );

    const links = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Ban Appeal')
        .setEmoji('🚫')
        .setStyle(ButtonStyle.Link)
        .setURL('https://melon.ly/form/7515216622148128768'),
      new ButtonBuilder()
        .setLabel('Official Staff Application')
        .setEmoji('🛡️')
        .setStyle(ButtonStyle.Link)
        .setURL('https://melon.ly/form/7515218285953028096'),
    );

    const dashboard = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          'Welcome to ***Texas State Roleplay*** (TXRP)! Founded in October, we are a serious Texas-based roleplay server set in Houston, Texas. We strive to provide realistic roleplay, professional departments, organized patrols, and an active community dedicated to quality roleplay and professionalism.'
        ),
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('-# Signed Foundership Team,'))
      .addActionRowComponents(new ActionRowBuilder().addComponents(regulationsMenu))
      .addActionRowComponents(links);

    await message.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [dashboard],
    });
    await message.react('✅').catch(() => {});
  },
};