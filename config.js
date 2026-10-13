const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    MessageFlags,
    PermissionFlagsBits,
} = require('discord.js');
const fs = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure the bot settings.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const superuserIds = interaction.client.config.SUPERUSER_IDS || [];
        const isSuperuser = superuserIds.includes(interaction.user.id);
        if (interaction.guild.ownerId !== interaction.user.id && !isSuperuser) {
            return interaction.reply({
                content: '❌ Only the server owner or a superuser can use `/config`.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const cfg = interaction.client.config;

        const mask = (val) =>
            val ? `\`${val.slice(0, 6)}${'•'.repeat(Math.min(val.length - 6, 20))}\`` : '`Not set`';
        const ch = (id) => (id ? `<#${id}>` : '`Not set`');
        const roles = (val) =>
            val
                ? val.split(',').map((r) => `<@&${r.trim()}>`).join(', ')
                : '`Not set`';
        const superusers = (arr) =>
            arr && arr.length ? arr.map((id) => `<@${id}>`).join(', ') : '`None`';

        const embed = new EmbedBuilder()
            .setTitle('⚙️  Bot Configuration')
            .setColor(0x2f3136)
            .addFields(
                {
                    name: '📢  Channels',
                    value: [
                        `**Applications:** ${ch(cfg.APPLICATION_CHANNEL_ID)}`,
                        `**Application Results:** ${ch(cfg.APP_RESULT_CHANNEL_ID)}`,
                        `**Promotion Log:** ${ch(cfg.PROMOTION_CHANNEL_ID)}`,
                        `**Infraction Log:** ${ch(cfg.INFRACTION_CHANNEL_ID)}`,
                        `**Output Log:** ${ch(cfg.OUTPUT_LOG_CHANNEL_ID)}`,
                        `**Ticket Transcripts:** ${ch(cfg.TRANSCRIPT_CHANNEL_ID)}`,
                    ].join('\n'),
                },
                {
                    name: '🛡️  Permission Roles',
                    value: [
                        `**Promotion:** ${roles(cfg.PROMOTION_PERM_ROLE_ID)}`,
                        `**Infraction:** ${roles(cfg.INFRACTION_PERM_ROLE_ID)}`,
                        `**Say Command:** ${roles(cfg.SAY_REQUIRED_ROLE_ID)}`,
                        `**Demote Command:** ${roles(cfg.DEMOTE_REQUIRED_ROLE_ID)}`,
                        `**Ticket Claim:** ${roles(cfg.TICKET_CLAIM_ROLE_ID)}`,
                        `**Ticket Close:** ${roles(cfg.TICKET_CLOSE_ROLE_ID)}`,
                        `**Giveaway Host:** ${roles(cfg.GIVEAWAY_HOST_ROLE_ID)}`,
                    ].join('\n'),
                },
                {
                    name: '📣  Session',
                    value: [
                        `**Channel:** ${ch(cfg.SESSION_CHANNEL_ID)}`,
                        `**Ping Role:** ${roles(cfg.SESSION_ROLE_ID)}`,
                        `**Notification Role:** ${roles(cfg.NOTIFICATION_ROLE_ID)}`,
                    ].join('\n'),
                },
                {
                    name: '⚠️  Infraction Roles',
                    value: [
                        `**Warning 1:** ${roles(cfg.WARNING_1_ROLE_ID)}`,
                        `**Warning 2:** ${roles(cfg.WARNING_2_ROLE_ID)}`,
                        `**Strike 1:** ${roles(cfg.STRIKE_1_ROLE_ID)}`,
                        `**Strike 2:** ${roles(cfg.STRIKE_2_ROLE_ID)}`,
                    ].join('\n'),
                },
                {
                    name: '👑  Superusers',
                    value: superusers(cfg.SUPERUSER_IDS),
                },
                {
                    name: '⌨️  Prefix',
                    value: `\`${cfg.PREFIX || '$'}\``,
                    inline: true,
                },
                {
                    name: '🆔  Guild ID',
                    value: cfg.GUILD_ID ? `\`${cfg.GUILD_ID}\`` : '`Not set`',
                    inline: true,
                },
                {
                    name: '🔑  API Keys',
                    value: [
                        `**ER:LC Key:** ${mask(cfg.ERLC_SERVER_KEY)}`,
                        `**Dock API:** ${mask(cfg.DOCK_API)}`,
                        `**MongoDB:** ${mask(cfg.MONGOURL)}`,
                    ].join('\n'),
                },
            )
            .setFooter({ text: 'Select an option below to change a setting.' })
            .setTimestamp();

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('config:select')
                .setPlaceholder('What would you like to configure?')
                .addOptions(
                    { label: '📋  Application Channel',     value: 'APPLICATION_CHANNEL_ID', description: 'Channel where staff applications are sent.' },
                    { label: '📢  Promotion Log Channel',   value: 'PROMOTION_CHANNEL_ID',   description: 'Channel where promotions are posted.' },
                    { label: '📢  Infraction Log Channel',  value: 'INFRACTION_CHANNEL_ID',  description: 'Channel where infractions are posted.' },
                    { label: '📢  Output Log Channel',      value: 'OUTPUT_LOG_CHANNEL_ID',  description: 'Channel for general bot output logs.' },
                    { label: '🛡️  Promotion Perm Roles',    value: 'PROMOTION_PERM_ROLE_ID',   description: 'Role IDs allowed to use /promote (comma-separated).' },
                    { label: '🛡️  Infraction Perm Roles',   value: 'INFRACTION_PERM_ROLE_ID',  description: 'Role IDs allowed to use /infraction (comma-separated).' },
                    { label: '🛡️  Say Required Role',        value: 'SAY_REQUIRED_ROLE_ID',     description: 'Role ID required to use /say.' },
                    { label: '🛡️  Demote Required Role',     value: 'DEMOTE_REQUIRED_ROLE_ID',  description: 'Role ID required to use /demote (leave blank for anyone).' },
                    { label: '🎫  Ticket Transcript Channel',  value: 'TRANSCRIPT_CHANNEL_ID',    description: 'Channel where ticket transcripts are posted.' },
                    { label: '🎫  Ticket Claim Role',         value: 'TICKET_CLAIM_ROLE_ID',     description: 'Role required to claim tickets (leave blank for anyone).' },
                    { label: '🎫  Ticket Close Role',         value: 'TICKET_CLOSE_ROLE_ID',     description: 'Role required to close tickets (leave blank for anyone).' },
                    { label: '📣  Session Channel',           value: 'SESSION_CHANNEL_ID',       description: 'Channel where session embeds are sent.' },
                    { label: '📣  Session Ping Role',         value: 'SESSION_ROLE_ID',          description: 'Role pinged for session-startup, vote, and boost.' },
                    { label: '🔔  Session Notification Role', value: 'NOTIFICATION_ROLE_ID',     description: 'Role mentioned in session-shutdown.' },
                    { label: '⌨️  Command Prefix',          value: 'PREFIX',                 description: 'Prefix for text commands like $verify.' },
                    { label: '🔑  ER:LC Server Key',        value: 'ERLC_SERVER_KEY',        description: 'Your ER:LC private server key.' },
                    { label: '🔑  Dock API Key',            value: 'DOCK_API',               description: 'Your Dock API key.' },
                    { label: '🔗  MongoDB URL',             value: 'MONGOURL',               description: 'MongoDB connection string.' },
                    { label: '🆔  Guild ID',                value: 'GUILD_ID',               description: 'Discord server ID for instant command sync.' },
                    { label: '⚠️  Warning 1 Role',           value: 'WARNING_1_ROLE_ID',      description: 'Role assigned when a Warning 1 infraction is issued.' },
                    { label: '⚠️  Warning 2 Role',           value: 'WARNING_2_ROLE_ID',      description: 'Role assigned when a Warning 2 infraction is issued.' },
                    { label: '🟠  Strike 1 Role',            value: 'STRIKE_1_ROLE_ID',       description: 'Role assigned when a Strike 1 infraction is issued.' },
                    { label: '🔴  Strike 2 Role',            value: 'STRIKE_2_ROLE_ID',       description: 'Role assigned when a Strike 2 infraction is issued.' },
                    { label: '👑  Add Superuser',           value: 'SUPERUSER_ADD',          description: 'Grant a user full staff command access.' },
                    { label: '👑  Remove Superuser',        value: 'SUPERUSER_REMOVE',       description: 'Revoke superuser access from a user.' },
                ),
        );

        const q = cfg.APP_QUESTIONS || [];
        const qEmbed = new EmbedBuilder()
            .setTitle('📝  Application Questions')
            .setColor(0x2f3136)
            .addFields(
                {
                    name: 'Part 1 (Q1–5)',
                    value: [1,2,3,4,5].map(i => `**${i}.** ${q[i-1] || '*Not set*'}`).join('\n'),
                },
                {
                    name: 'Part 2 (Q6–10)',
                    value: [6,7,8,9,10].map(i => `**${i}.** ${q[i-1] || '*Not set*'}`).join('\n'),
                },
                {
                    name: 'Part 3 (Q11–15)',
                    value: [11,12,13,14,15].map(i => `**${i}.** ${q[i-1] || '*Not set*'}`).join('\n'),
                },
            )
            .setFooter({ text: 'Select a part below to edit its questions.' });

        const questionsMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('config:questions')
                .setPlaceholder('Edit application questions…')
                .addOptions(
                    { label: '📋  Application Result Channel', value: 'APP_RESULT_CHANNEL_ID', description: 'Channel where accepted/denied results are logged.' },
                    { label: '🎉  Giveaway Host Role',    value: 'GIVEAWAY_HOST_ROLE_ID', description: 'Role required to host giveaways.' },
                    { label: '📝  Edit Questions 1–5',   value: 'APP_QUESTIONS_1', description: 'Edit Part 1 of the staff application.' },
                    { label: '📝  Edit Questions 6–10',  value: 'APP_QUESTIONS_2', description: 'Edit Part 2 of the staff application.' },
                    { label: '📝  Edit Questions 11–15', value: 'APP_QUESTIONS_3', description: 'Edit Part 3 of the staff application.' },
                ),
        );

        return interaction.reply({ embeds: [embed, qEmbed], components: [menu, questionsMenu], flags: MessageFlags.Ephemeral });
    },
};
