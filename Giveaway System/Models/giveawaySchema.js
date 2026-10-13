const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
    messageId: String,
    channelId: String,
    guildId: String,
    title: String,
    description: String,
    prize: String,
    winnersCount: Number,
    endTime: Date,
    participants: [String],
    ended: { type: Boolean, default: false }
});

module.exports = mongoose.model('Giveaway', giveawaySchema);
