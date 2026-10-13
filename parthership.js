const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');

const CHANNEL_ID  = '1503678549830275073';
const PERM_ROLES  = ['1554733376429228032', '1503764092123349052'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('partnership')
        .setDescription('Send a partnership ad to the partnership channel.')
        .addStringOption(o => o
            .setName('ad')
            .setDescription('The partnership advertisement message.')
            .setRequired(true))
        .addStringOption(o => o
            .setName('invite')
            .setDescription('The Discord invite link for the server.')
            .setRequired(true)),

    async execute(interaction) {
        const hasRole = PERM_ROLES.some(id => interaction.member.roles.cache.has(id));
        if (!hasRole) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const ad     = interaction.options.getString('ad');
        const invite = interaction.options.getString('invite');

        const channel = interaction.guild.channels.cache.get(CHANNEL_ID)
            || await interaction.guild.channels.fetch(CHANNEL_ID).catch(() => null);

        if (!channel) {
            return interaction.reply({
                content: '❌ Partnership channel not found.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🤝  Partnership')
            .setDescription(ad)
            .setColor(0xFF8C14)
            .setFooter({ text: `Posted by ${interaction.user.tag}` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Join Server')
                .setStyle(ButtonStyle.Link)
                .setURL(invite)
                .setEmoji('🔗'),
        );

        await channel.send({ embeds: [embed], components: [row] });

        return interaction.reply({
            content: `✅ Partnership ad posted to ${channel}.`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
