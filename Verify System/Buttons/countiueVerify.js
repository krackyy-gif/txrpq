const {
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require("discord.js");
const { getRobloxInfo } = require("../Utils/docksystem");

const ADD_ROLE_ID = "1456077337534791701";
const REMOVE_ROLE_ID = "1456077351199838282";
const LOG_CHANNEL_ID = "1456770628156653850";

module.exports = {
    customID: "continue-verify",

    async execute(interaction, client) {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate();
        }

        const { robloxId, username, error } = await getRobloxInfo(
            interaction.user.id,
            interaction,
            client
        );

        if (error) {
            return interaction.editReply({
                content: "Verification failed.",
                components: [],
            });
        }

        const member = await interaction.guild.members.fetch(interaction.user.id);

        await member.roles.add(ADD_ROLE_ID).catch(() => { });
        await member.roles.remove(REMOVE_ROLE_ID).catch(() => { });

        const profileLink = `https://www.roblox.com/users/${robloxId}/profile`;

        const components = [
            new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("### Verification Successful")
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `Verified under **[${username}](${profileLink})**`
                    )
                ),
        ];

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components,
        });

        const logEmbed = new EmbedBuilder()
            .setTitle("New Account Verification")
            .setDescription(
                `**${interaction.user.username}** has **successfully** linked their Roblox account.`
            )
            .addFields(
                { name: "** Joined**", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: "**Verified At**", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: "**Roblox Username**", value: `\`${username}\``, inline: true },
                { name: "**Roblox ID**", value: `\`${robloxId.toString()}\``, inline: true },
                { name: "**Discord User**", value: `\`${interaction.user.id}\``, inline: true },
                { name: "**Discord User**", value: `<@${interaction.user.id}>`, inline: true }
            )
            .setImage('https://media.discordapp.net/attachments/1456184292983177349/1456764244245876918/Footer.png?ex=69598ced&is=69583b6d&hm=94f2070aea13e011c2932507cec5ca3360d4ad6847b2c2d496afe3043704a1a4&=&format=webp&quality=lossless&width=1315&height=71')
            .setColor("#2b2d31");

        const profile = new ButtonBuilder()
            .setLabel("View Profile")
            .setURL(profileLink)
            .setStyle(ButtonStyle.Link);

        const actionRow = new ActionRowBuilder().addComponents(profile);

        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            await logChannel.send({ embeds: [logEmbed], components: [actionRow] });
        }
    },
};
