const { MessageFlags } = require('discord.js');

const REQUIRED_VOTES = 7;

module.exports = {
  customID: 'viewvote:button',

  async execute(interaction, client) {
    const sessionId    = interaction.customId.split('_')[1];
    const sessionVotes = client.voteMap?.get(sessionId) || new Map();

    const voterMentions = [...sessionVotes.keys()].map(id => `<@${id}>`);
    const content = voterMentions.length > 0 ? voterMentions.join('\n') : 'No votes yet.';

    await interaction.reply({
      content: `**Voters List (\`${sessionVotes.size}/${REQUIRED_VOTES}\`)**:\n${content}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
