const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const TICKET_TYPES = require('../utils/ticketTypes');
const { hasPerm } = require('../utils/staffHelpers');

const PANEL_CHOICES = Object.entries(TICKET_TYPES).map(([key, val]) => ({
  name: val.label,
  value: key,
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('switchpanel')
    .setDescription('Switch this ticket channel to a different panel category and ping its role.')
    .addStringOption(o =>
      o.setName('panel')
        .setDescription('The panel to switch this ticket to.')
        .setRequired(true)
        .addChoices(...PANEL_CHOICES)
    ),

  async execute(interaction) {
    if (!interaction.channel.name.endsWith('-ticket')) {
      return interaction.reply({ content: '❌ This command can only be used inside a ticket channel.', flags: MessageFlags.Ephemeral });
    }

    if (!hasPerm(interaction)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
    }

    const key    = interaction.options.getString('panel');
    const panel  = TICKET_TYPES[key];
    const ch     = interaction.channel;

    if (!panel) {
      return interaction.reply({ content: '❌ Invalid panel selected.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (panel.categoryId) {
      const category = interaction.guild.channels.cache.get(panel.categoryId)
        || await interaction.guild.channels.fetch(panel.categoryId).catch(() => null);

      if (category) {
        await ch.setParent(panel.categoryId, { lockPermissions: false }).catch(e => {
          console.error('Failed to move channel:', e);
        });
      }
    }

    if (panel.pingRoleId) {
      await ch.permissionOverwrites.edit(panel.pingRoleId, {
        ViewChannel: true,
        SendMessages: true,
      }).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setColor('#242429')
      .setTitle('Panel Switched')
      .setDescription(`This ticket has been moved to **${panel.label}**.`)
      .addFields(
        { name: 'New Panel',    value: panel.label,                       inline: true },
        { name: 'Switched By',  value: `${interaction.user}`,             inline: true },
        { name: 'Ping Role',    value: panel.pingRoleId ? `<@&${panel.pingRoleId}>` : 'None', inline: true },
      )
      .setTimestamp();

    await ch.send({
      content: panel.pingRoleId ? `<@&${panel.pingRoleId}>` : '',
      embeds: [embed],
    });

    await interaction.editReply(`✅ Ticket switched to **${panel.label}**.`);
  },
};
