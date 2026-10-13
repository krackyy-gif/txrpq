const { SlashCommandBuilder } = require('discord.js');
const Giveaway = require('../models/giveawaySchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway-reroll')
        .setDescription('Reroll a giveaway')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('Message ID of the giveaway')
                .setRequired(true)
        ),

    async execute(interaction) {
        const requiredRoleId = ''; // put  role id
        
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({
            content: `You don't have permission to use this command.`,
            ephemeral: true
        });
        } 
        const messageId = interaction.options.getString('messageid');
        const giveaway = await Giveaway.findOne({ messageId });

        if (!giveaway) return interaction.reply({ content: 'Giveaway not found.', ephemeral: true });
        if (!giveaway.ended) return interaction.reply({ content: 'Giveaway hasn’t ended yet.', ephemeral: true });
        if (!giveaway.participants.length) return interaction.reply({ content: 'No participants.', ephemeral: true });

        const winners = [];
        for (let i = 0; i < giveaway.winnersCount && giveaway.participants.length > 0; i++) {
            const winnerIndex = Math.floor(Math.random() * giveaway.participants.length);
            winners.push(giveaway.participants.splice(winnerIndex, 1)[0]);
        }

        const winnerMentions = winners.map(w => `<@${w}>`).join(', ');
        const channel = await interaction.guild.channels.fetch(giveaway.channelId);
        const message = await channel.messages.fetch(giveaway.messageId);

        await message.reply(`Rerolled winners: ${winnerMentions}`);
        interaction.reply({ content: 'Giveaway rerolled successfully!', ephemeral: true });
    }
};
