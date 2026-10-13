const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} = require('discord.js');

module.exports = {
    customID: 'apply:select',

    async execute(interaction) {
        if (!interaction.client.applicationData) interaction.client.applicationData = new Map();

        interaction.client.applicationData.set(interaction.user.id, { page: 1, answers: {} });

        const q = interaction.client.config.APP_QUESTIONS || [];

        const modal = new ModalBuilder()
            .setCustomId('apply_modal_1')
            .setTitle('Staff Application (1 of 3)');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('q1').setLabel(`1. ${q[0] || 'Question 1'}`).setStyle(TextInputStyle.Short).setRequired(true),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('q2').setLabel(`2. ${q[1] || 'Question 2'}`).setStyle(TextInputStyle.Short).setRequired(true),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('q3').setLabel(`3. ${q[2] || 'Question 3'}`).setStyle(TextInputStyle.Short).setRequired(true),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('q4').setLabel(`4. ${q[3] || 'Question 4'}`).setStyle(TextInputStyle.Short).setRequired(true),
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('q5').setLabel(`5. ${q[4] || 'Question 5'}`).setStyle(TextInputStyle.Paragraph).setRequired(true),
            ),
        );

        return interaction.showModal(modal);
    },
};
