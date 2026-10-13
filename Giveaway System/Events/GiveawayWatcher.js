const giveawayChecker = require('../utils/GiveawayChecker');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        giveawayChecker(client);
    },
};
