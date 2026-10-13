const {
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    MessageFlags,
    ButtonBuilder,
    ButtonStyle,
    SectionBuilder,
    PermissionFlagsBits,
} = require('discord.js');

module.exports = {
    name: 'verify',

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.react('❌').catch(() => {});
        }

        const components = [
            new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent('### Verification Panel'))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        'At **Texas State Management**, we use **Dock Systems** to verify users. In order to gain access to the rest of the server, you must verify your Roblox account. Please click the **verification** button below to get started.'
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent('Verify using the button here:'))
                        .setButtonAccessory(
                            new ButtonBuilder().setCustomId('start-verify').setLabel('Begin Verification').setStyle(ButtonStyle.Secondary)
                        )
                ),
        ];

        await message.channel.send({ flags: MessageFlags.IsComponentsV2, components });
        await message.react('✅').catch(() => {});
    },
};
