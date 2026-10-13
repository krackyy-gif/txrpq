const axios = require("axios");

async function getRobloxInfo(userId, interaction, client) {
    try {
        const res = await axios.get(
            "https://api.docksys.xyz/api/v1/public/discord-to-roblox",
            {
                headers: {
                    Authorization: `Bearer ${client.config.DOCK_API}`,
                },
                params: {
                    discordId: userId,
                    guildId: interaction.guild.id,
                },
            },
        );

        if (!res.data || !res.data.data || !res.data.data.robloxId) {
            return { error: "No Roblox ID found for this Discord user." };
        }

        const robloxId = res.data.data.robloxId;

        const res2 = await axios.get(
            `https://users.roblox.com/v1/users/${robloxId}`,
        );

        const username = res2.data.name;

        return { robloxId, username };
    } catch (err) {
        console.error("Error in getRobloxInfo:", err.response?.data || err.message);
        return { error: "Failed to fetch Roblox info." };
    }
}

module.exports = { getRobloxInfo };
