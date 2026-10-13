const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require('discord.js');
const Giveaway = require('../models/giveawaySchema');
const ms = require('ms');
const { hasPerm } = require('../utils/staffHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Giveaway management.')
    .addSubcommand(sub => sub
      .setName('create')
      .setDescription('Create a new giveaway.')
      .addStringOption(o => o.setName('prize').setDescription('The prize of the giveaway.').setRequired(true))
      .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 1h, 30m, 2d).').setRequired(true))
      .addIntegerOption(o => o.setName('winners').setDescription('Number of winners.').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('end')
      .setDescription('End a giveaway manually.')
      .addStringOption(o => o.setName('messageid').setDescription('The message ID of the giveaway.').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('reroll')
      .setDescription('Reroll a giveaway.')
      .addStringOption(o => o.setName('messageid').setDescription('Message ID of the giveaway.').setRequired(true))
    ),

  async execute(interaction) {
    const cfg = interaction.client.config;
    const giveawayRoleId = cfg.GIVEAWAY_HOST_ROLE_ID;
    const superuserIds = (cfg.SUPERUSER_IDS || []).map(String);
    const isSuperuser = superuserIds.includes(String(interaction.user.id));
    const hasGiveawayRole = giveawayRoleId
      ? interaction.member.roles.cache.has(giveawayRoleId)
      : hasPerm(interaction);
    if (!isSuperuser && !hasGiveawayRole) {
      return interaction.reply({ content: '❌ You do not have permission to host giveaways.', flags: MessageFlags.Ephemeral });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      const prize        = interaction.options.getString('prize');
      const duration     = interaction.options.getString('duration');
      const winnersCount = interaction.options.getInteger('winners');
      const durationMs   = ms(duration);

      if (!durationMs || durationMs < 10000) {
        return interaction.reply({ content: '❌ Invalid duration format or too short (minimum 10s).', flags: MessageFlags.Ephemeral });
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const endTime      = new Date(Date.now() + durationMs);
      const endTimestamp = Math.floor(endTime.getTime() / 1000);

      const container = new ContainerBuilder()
        .setAccentColor(0x242429)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Prize:** ${prize}\n**Ends:** <t:${endTimestamp}:R>\n**Winners:** **${winnersCount}**`
          )
        )
        .addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large))
        .addActionRowComponents(row =>
          row.addComponents(
            new ButtonBuilder().setCustomId('join').setEmoji('1475708586414833757').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('entries').setLabel('0').setEmoji('1475708583860506736').setStyle(ButtonStyle.Secondary)
          )
        );

      const message = await interaction.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });

      try {
        await Giveaway.create({
          messageId: message.id,
          channelId: message.channel.id,
          guildId: message.guild.id,
          prize,
          winnersCount,
          endTime,
          participants: [],
          ended: false,
        });
      } catch {
        return interaction.editReply('⚠️ Giveaway posted but database is unavailable — entries will not be saved.');
      }

      return interaction.editReply('✅ Giveaway created successfully!');
    }

    if (sub === 'end') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const messageId = interaction.options.getString('messageid');

      let giveaway;
      try {
        giveaway = await Giveaway.findOne({ messageId });
      } catch {
        return interaction.editReply('❌ Database is currently unavailable. Please try again later.');
      }

      if (!giveaway)      return interaction.editReply('❌ Giveaway not found.');
      if (giveaway.ended) return interaction.editReply('❌ This giveaway has already ended.');

      const channel = await interaction.guild.channels.fetch(giveaway.channelId).catch(() => null);
      if (!channel) return interaction.editReply('❌ Channel not found.');

      const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
      if (!message) return interaction.editReply('❌ Message not found.');

      const now = new Date();
      const container = new ContainerBuilder()
        .setAccentColor(0x242429)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Prize:** ${giveaway.prize}\n**Ended:** <t:${Math.floor(now.getTime() / 1000)}:R>\n**Winners:** **${giveaway.winnersCount}**`
          )
        )
        .addSeparatorComponents(s => s.setSpacing(SeparatorSpacingSize.Large))
        .addActionRowComponents(row =>
          row.addComponents(
            new ButtonBuilder().setCustomId('join').setEmoji('1475708586414833757').setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId('entries').setLabel(`${giveaway.participants.length}`).setEmoji('1475708583860506736').setStyle(ButtonStyle.Secondary).setDisabled(true),
          )
        );

      await message.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });

      if (!giveaway.participants.length) {
        await message.reply('Giveaway ended, but no one participated.');
        giveaway.ended = true;
        await giveaway.save().catch(console.error);
        return interaction.editReply('Giveaway ended — no participants.');
      }

      const pool    = [...giveaway.participants];
      const winners = [];
      for (let i = 0; i < giveaway.winnersCount && pool.length > 0; i++) {
        winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      }

      await message.reply(`Congratulations ${winners.map(w => `<@${w}>`).join(', ')} — you won **${giveaway.prize}**!`);

      giveaway.ended = true;
      await giveaway.save().catch(console.error);

      return interaction.editReply('✅ Giveaway ended and winners announced!');
    }

    if (sub === 'reroll') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const messageId = interaction.options.getString('messageid');

      let giveaway;
      try {
        giveaway = await Giveaway.findOne({ messageId });
      } catch {
        return interaction.editReply('❌ Database is currently unavailable. Please try again later.');
      }

      if (!giveaway)                     return interaction.editReply('❌ Giveaway not found.');
      if (!giveaway.ended)               return interaction.editReply('❌ Giveaway has not ended yet.');
      if (!giveaway.participants.length) return interaction.editReply('❌ No participants.');

      const pool    = [...giveaway.participants];
      const winners = [];
      for (let i = 0; i < giveaway.winnersCount && pool.length > 0; i++) {
        winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      }

      const channel = await interaction.guild.channels.fetch(giveaway.channelId).catch(() => null);
      const message = channel ? await channel.messages.fetch(giveaway.messageId).catch(() => null) : null;
      if (message) await message.reply(`🎉 Rerolled winners: ${winners.map(w => `<@${w}>`).join(', ')}`);

      return interaction.editReply('✅ Giveaway rerolled successfully!');
    }
  },
};
