const {
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');
const { getRobloxInfo } = require('../utils/docksystem');

module.exports = {
  customID: 'start-verify',

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const data = await getRobloxInfo(interaction.user.id, interaction, client);

    if (data?.unlinked) {
      return interaction.editReply({
        content: 'Your Discord account is not linked to a Roblox account in DockSys. Authorize your Roblox account to continue.',
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel('Authorize Roblox Account')
              .setStyle(ButtonStyle.Link)
              .setURL('https://authorize.roblox.com/?client_id=4909123827170328246&response_type=code&redirect_uri=https%3A%2F%2Fapi.docksys.xyz%2Fv1%2Fapi%2Froblox%2Fcallback&scope=openid+profile&state=bnSAL8oaQbcJyLvugUdnZrWm&nonce=ZJ6MgnnblWU3aQhOq8Ufs_2PZ0Ca41b_bkSY6gM6RtQ&code_challenge=h9jm2Pm9vvGNhwhdWp2ccq2iN044jghLmeeU29GV280&code_challenge_method=S256&step=landing'),
          ),
        ],
      });
    }

    if (!data || data.error) {
      return interaction.editReply("❌ Couldn't verify your Roblox account. Make sure your Discord is linked in Docksys.");
    }

    const { robloxId, username } = data;
    const profileLink = `https://www.roblox.com/users/${robloxId}/profile`;

    const components = [
      new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('## Roblox Verification'))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `You already have **[${username}](${profileLink})** linked.\n\nTo switch to a different account, click **Change Account**.\nTo continue using this account, click **Continue**.`
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Change Account').setEmoji('<:refresh:1456476619580375041>').setStyle(ButtonStyle.Link).setURL('https://docksys.xyz/account'),
            new ButtonBuilder().setCustomId('continue-verify').setLabel('Continue').setEmoji('<:rightarrow:1456476621157433355>').setStyle(ButtonStyle.Success)
          )
        ),
    ];

    await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components });
  },
};
