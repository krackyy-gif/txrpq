const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    MessageFlags,
} = require('discord.js');

const MODAL_CONFIGS = {
    APPLICATION_CHANNEL_ID:  { label: 'Application Channel ID',          placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    APP_RESULT_CHANNEL_ID:   { label: 'Application Result Log Channel',  placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    PROMOTION_CHANNEL_ID:  { label: 'Promotion Log Channel ID',        placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    INFRACTION_CHANNEL_ID: { label: 'Infraction Log Channel ID',       placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    OUTPUT_LOG_CHANNEL_ID: { label: 'Output Log Channel ID',           placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    PROMOTION_PERM_ROLE_ID: { label: 'Promotion Perm Role IDs',         placeholder: 'Comma-separated: 111111, 222222',   style: TextInputStyle.Paragraph },
    INFRACTION_PERM_ROLE_ID:{ label: 'Infraction Perm Role IDs',        placeholder: 'Comma-separated: 111111, 222222',   style: TextInputStyle.Paragraph },
    TRANSCRIPT_CHANNEL_ID:  { label: 'Ticket Transcript Channel ID',   placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    TICKET_CLAIM_ROLE_ID:   { label: 'Ticket Claim Required Role ID',  placeholder: 'Leave blank to allow anyone',       style: TextInputStyle.Short },
    TICKET_CLOSE_ROLE_ID:   { label: 'Ticket Close Required Role ID',  placeholder: 'Leave blank to allow anyone',       style: TextInputStyle.Short },
    SAY_REQUIRED_ROLE_ID:   { label: 'Say Command Required Role ID',    placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    DEMOTE_REQUIRED_ROLE_ID:{ label: 'Demote Command Required Role ID', placeholder: 'Leave blank to allow anyone',       style: TextInputStyle.Short },
    SESSION_CHANNEL_ID:     { label: 'Session Channel ID',              placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    SESSION_ROLE_ID:        { label: 'Session Ping Role ID',            placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    NOTIFICATION_ROLE_ID:   { label: 'Session Notification Role ID',    placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    PREFIX:                { label: 'Command Prefix',                  placeholder: 'e.g. $ or !',                       style: TextInputStyle.Short },
    ERLC_SERVER_KEY:       { label: 'ER:LC Server Key',                placeholder: 'Your private server key',           style: TextInputStyle.Short },
    DOCK_API:              { label: 'Dock API Key',                    placeholder: 'Your Dock API key',                 style: TextInputStyle.Short },
    MONGOURL:              { label: 'MongoDB Connection URL',          placeholder: 'mongodb+srv://...',                 style: TextInputStyle.Paragraph },
    GUILD_ID:              { label: 'Guild (Server) ID',               placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    GIVEAWAY_HOST_ROLE_ID: { label: 'Giveaway Host Role ID',             placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    WARNING_1_ROLE_ID:     { label: 'Warning 1 Role ID',               placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    WARNING_2_ROLE_ID:     { label: 'Warning 2 Role ID',               placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    STRIKE_1_ROLE_ID:      { label: 'Strike 1 Role ID',                placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    STRIKE_2_ROLE_ID:      { label: 'Strike 2 Role ID',                placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    SUPERUSER_ADD:         { label: 'User ID to Add as Superuser',     placeholder: 'e.g. 1234567890123456789',          style: TextInputStyle.Short },
    SUPERUSER_REMOVE:      { label: 'User ID to Remove from Superusers', placeholder: 'e.g. 1234567890123456789',        style: TextInputStyle.Short },
};

module.exports = {
    customID: 'config:select',

    async execute(interaction) {
        const superuserIds = (interaction.client.config.SUPERUSER_IDS || []).map(String);
        const isSuperuser = superuserIds.includes(String(interaction.user.id));
        if (interaction.guild.ownerId !== interaction.user.id && !isSuperuser) {
            return interaction.reply({
                content: '❌ Only the server owner or a superuser can use this.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const selected = interaction.values[0];
        const cfg = MODAL_CONFIGS[selected];
        if (!cfg) return;

        const modal = new ModalBuilder()
            .setCustomId(`config_modal:${selected}`)
            .setTitle('⚙️  Bot Configuration');

        const input = new TextInputBuilder()
            .setCustomId('value')
            .setLabel(cfg.label)
            .setPlaceholder(cfg.placeholder)
            .setStyle(cfg.style)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
    },
};
