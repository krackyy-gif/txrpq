const {
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    MessageFlags,
    ButtonBuilder,
    ButtonStyle,
    SectionBuilder,
} = require("discord.js");

module.exports = {
    name: "verify",
    description: "Sends the verification panel.",
    async execute(message) {
        await message.delete();

        const components = [
            new ContainerBuilder()
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems(
                        new MediaGalleryItemBuilder().setURL(
                            ""
                        )
                    )
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("### Verification Panel")
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        "At **Los Angeles**, we use **Dock Systems** to verify users. In order to gain access to the rest of the server, you must verify your Roblox account. Please click the **verification** button below this message to get started in the verification process."
                    )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setDivider(true)
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                "Verify using the button here:"
                            )
                        )
                        .setButtonAccessory(
                            new ButtonBuilder()
                                .setCustomId("start-verify")
                                .setLabel("Begin Verification")
                                .setStyle(ButtonStyle.Secondary)
                        )
                ),
        ];

        await message.channel.send({
            flags: MessageFlags.IsComponentsV2,
            components,
        });
    },
};
