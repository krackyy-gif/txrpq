const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ticket',
    cooldown: 5,

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.react('❌').catch(() => {});
        }

        const embed = new EmbedBuilder()
            .setDescription(
                `# <:Logo:1505199413717635142> Texas State Assistance\n` +
                `Welcome to **Texas State Roleplay** ticket support options!\n\n` +
                `<:Logo:1505199413717635142> **General Support**\n` +
                `- Questions about in-game Moderation\n` +
                `- In-Game Concerns\n` +
                `- General Questions\n\n` +
                `<:Logo:1505199413717635142> **Internal Affairs Support**\n` +
                `- Reporting a staff member\n` +
                `- Internal Affairs Questions\n` +
                `- Internal Affairs Related\n\n` +
                `<:Logo:1505199413717635142>
                **Management Support**\n` +
                `- Reporting a internal affairs member\n` +
                `- Management Questions\n` +
                `- Management Related\n\n` +
                `<:Logo:1505199413717635142>
                **Foundership Support**\n` +
                `- Claiming giveaways\n` +
                `- Contacting the owner\n` +
                `- Foundership Related\n\n\n`
            );

        await message.channel.send({ embeds: [embed] }).catch(err => console.error('Failed to send ticket embed:', err));

        await message.channel.send({
            flags: 32768,
            components: [
                {
                    type: 17,
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    custom_id: 'ticketDropdown',
                                    placeholder: 'Texas State Assistance',
                                    min_values: 1,
                                    max_values: 1,
                                    options: [
                                        { label: 'General Support',          value: '6r6SScjnYI', description: 'General Support Related',          emoji: { id: '1505199413717635142', name: 'Logo', animated: false } },
                                        { label: 'Internal Affairs Support', value: 'UX0vh0SS8o', description: 'Internal Affairs Support Related', emoji: { id: '1505199413717635142', name: 'Logo', animated: false } },
                                        { label: 'Management Support',       value: 'FP2suQkxUI', description: 'Management Support Related',       emoji: { id: '1505199413717635142', name: 'Logo', animated: false } },
                                        { label: 'Foundership Support',      value: 'me3Mz00V9q', description: 'Foundership Support Related',      emoji: { id: '1505199413717635142', name: 'Logo', animated: false } },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        }).catch(err => console.error('Failed to send ticket panel:', err));

        await message.react('✅').catch(() => {});
    },
};