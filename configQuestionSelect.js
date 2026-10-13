const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    MessageFlags,
} = require('discord.js');

const PART_RANGES = {
    APP_QUESTIONS_1: [0, 1, 2, 3, 4],
    APP_QUESTIONS_2: [5, 6, 7, 8, 9],
    APP_QUESTIONS_3: [10, 11, 12, 13, 14],
};

const PART_TITLES = {
    APP_QUESTIONS_1: 'Application Questions (1–5)',
    APP_QUESTIONS_2: 'Application Questions (6–10)',
    APP_QUESTIONS_3: 'Application Questions (11–15)',
};

module.exports = {
    customID: 'config:questions',

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

        const singleFieldOptions = {
            GIVEAWAY_HOST_ROLE_ID: { label: 'Giveaway Host Role ID',            placeholder: 'e.g. 1234567890123456789' },
            APP_RESULT_CHANNEL_ID: { label: 'Application Result Log Channel ID', placeholder: 'e.g. 1234567890123456789' },
        };

        if (singleFieldOptions[selected]) {
            const { label, placeholder } = singleFieldOptions[selected];
            const current = interaction.client.config[selected] || '';
            const modal = new ModalBuilder()
                .setCustomId(`config_modal:${selected}`)
                .setTitle('⚙️  Bot Configuration');
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('value')
                        .setLabel(label)
                        .setPlaceholder(placeholder)
                        .setStyle(TextInputStyle.Short)
                        .setValue(current)
                        .setRequired(false),
                ),
            );
            return interaction.showModal(modal);
        }

        const indices = PART_RANGES[selected];
        if (!indices) return;

        const questions = interaction.client.config.APP_QUESTIONS || [];

        const modal = new ModalBuilder()
            .setCustomId(`config_modal:${selected}`)
            .setTitle(PART_TITLES[selected]);

        for (let i = 0; i < 5; i++) {
            const idx = indices[i];
            const num = idx + 1;
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`q${num}`)
                        .setLabel(`Question ${num}`)
                        .setStyle(TextInputStyle.Short)
                        .setValue(questions[idx] || '')
                        .setRequired(true)
                        .setMaxLength(100),
                ),
            );
        }

        return interaction.showModal(modal);
    },
};
