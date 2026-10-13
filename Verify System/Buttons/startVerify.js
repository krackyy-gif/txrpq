const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const { getRobloxInfo } = require("../Utils/docksystem");

module.exports = {
    customID: "start-verify",
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const data = await getRobloxInfo(
            interaction.user.id,
            interaction,
            client
        );

        if (!data || data.error) {
            return interaction.reply({
                content:
                    "Couldn't verify your Roblox account. Make sure your Discord is linked in Docksys.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const { robloxId, username } = data;

        const profileLink = `https://www.roblox.com/users/${robloxId}/profile`;

        const components = [
            new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("## Roblox Verification")
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `You already have **[${username}](${profileLink})** linked.\n\nTo switch to a different account, click **Change Account**.\nTo continue using this account, click **Continue**.`
                    )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setDivider(true)
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addActionRowComponents(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel("Change Account")
                            .setEmoji("<:refresh:1456476619580375041>")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://docksys.xyz/account"),
                        new ButtonBuilder()
                            .setCustomId("continue-verify")
                            .setLabel("Continue")
                            .setEmoji("<:rightarrow:1456476621157433355>")
                            .setStyle(ButtonStyle.Success)
                    )
                ),
        ];

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true,
            components: components,
        });
    },
};
