const { SlashCommandBuilder, ActivityType, MessageFlags } = require('discord.js');
const { COLORS, hasPerm, sendOutputLog } = require('../utils/staffHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setstatus')
    .setDescription("Change the bot's activity status.")
    .addStringOption(o => o.setName('status').setDescription('The status text.').setRequired(true))
    .addStringOption(o =>
      o.setName('type').setDescription('Activity type.').setRequired(false)
       .addChoices(
         { name: 'Playing',   value: 'playing'   },
         { name: 'Watching',  value: 'watching'  },
         { name: 'Listening', value: 'listening' },
       )
    ),

  async execute(interaction) {
    if (!hasPerm(interaction)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
    }

    const statusText = interaction.options.getString('status');
    const type       = interaction.options.getString('type') || 'watching';

    const typeMap = {
      watching:  ActivityType.Watching,
      listening: ActivityType.Listening,
      playing:   ActivityType.Playing,
    };

    await interaction.client.user.setActivity({ name: statusText, type: typeMap[type] });

    await sendOutputLog(interaction.client, {
      action: 'Status Changed',
      moderator: interaction.user.tag,
      detail: `${type.charAt(0).toUpperCase() + type.slice(1)} ${statusText}`,
      color: COLORS.INFO,
    });

    await interaction.reply({ content: `✅ Status set to **${type.charAt(0).toUpperCase() + type.slice(1)} ${statusText}**`, flags: MessageFlags.Ephemeral });
  },
};
