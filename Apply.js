const {
    ContainerBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    MessageFlags,
    EmbedBuilder,
    PermissionFlagsBits,
} = require('discord.js');

module.exports = {
    name: 'apply',

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.react('❌').catch(() => {});
        }

        const embed = new EmbedBuilder()
            .setDescription(
                '# <:Logo:1505199413717635142>  Staff Team Application\n' +
                'Our staff moderates to keep the roleplay fun and ensure nobody breaks the rules. It\'s all so you guys can play fairly! **Thank you for applying.**\n\n' +
                '***Requirements***\n\n' +
                '- 13 years or older\n' +
                '- Basic maturity and professionalism\n' +
                '- Able to use proper spelling and grammar\n' +
                '- Discord account is 1 month or older\n' +
                '- Roblox account is 1 month or older\n'
            )
            .setColor(0x2b2d31);

        await message.channel.send({ embeds: [embed] });

        const components = [
            new ContainerBuilder()
                .addActionRowComponents(
                    new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('apply:select')
                            .setPlaceholder('Texas State Staff Team Application')
                            .addOptions({
                                label: 'Moderator Staff Application',
                                value: 'moderator',
                                emoji: { id: '1503770694876659862', name: 'unknown', animated: false },
                            }),
                    ),
                ),
        ];

        await message.channel.send({ flags: MessageFlags.IsComponentsV2, components });
        await message.react('✅').catch(() => {});
    },
};
