const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Case, nextCaseNumber } = require('../models/caseSchema');
const {
  COLORS, PUNISHMENT_ICONS, PUNISHMENT_COLORS, PUNISHMENT_TYPES,
  FOOTER_TEXT, hasPerm, isSuperuser, sendOutputLog,
} = require('../utils/staffHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infraction')
    .setDescription('Issue a staff infraction.')
    .addUserOption(o => o.setName('member').setDescription('The staff member receiving the infraction.').setRequired(true))
    .addStringOption(o =>
      o.setName('punishment').setDescription('Type of punishment.').setRequired(true)
       .addChoices(...PUNISHMENT_TYPES.map(p => ({ name: p, value: p })))
    )
    .addStringOption(o => o.setName('reason').setDescription('Reason for the infraction.').setRequired(true))
    .addStringOption(o => o.setName('notes').setDescription('Any additional notes.').setRequired(false)),

  async execute(interaction) {
    if (!hasPerm(interaction)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
    }

    const target = interaction.options.getMember('member');
    if (!target) return interaction.reply({ content: '❌ Could not find that member.', flags: MessageFlags.Ephemeral });

    if (!isSuperuser(interaction.user.id, interaction.client.config)) {
      if (target.id !== interaction.user.id && target.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({ content: '❌ You cannot infract someone with the same or higher rank than you.', flags: MessageFlags.Ephemeral });
      }
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const punishment = interaction.options.getString('punishment');
    const reason     = interaction.options.getString('reason');
    const notes      = interaction.options.getString('notes') || 'None';

    const caseNum = await nextCaseNumber().catch(() => null);

    if (caseNum) {
      await Case.create({
        caseNumber: caseNum,
        type: 'infraction',
        userId: target.id,
        username: target.user.username,
        guildId: interaction.guild.id,
        punishment,
        reason,
        notes,
        issuedBy: interaction.user.tag,
        issuedById: interaction.user.id,
      }).catch(console.error);
    }

    const color = PUNISHMENT_COLORS[punishment] || COLORS.DANGER;
    const icon  = PUNISHMENT_ICONS[punishment]  || '⚠️';

    const titleMap = {
      'Verbal Warning':      '🔵  Verbal Warning',
      'Retirement':          '🎖️  Staff Retirement',
      'Strict Watch':        '👁️  Strict Watch Notice',
      'Termination':         '🚫  Staff Termination',
      'Suspension':          '⛔  Staff Suspension',
    };
    const descMap = {
      'Verbal Warning':      `${target} has received a **Verbal Warning**.\nThis is an informal notice — no formal record is escalated at this time.`,
      'Retirement':          `Thank you for your dedicated service, ${target}.\nYour contributions to **Texas State Management** have been invaluable.`,
      'Strict Watch':        `${target} has been placed on **Strict Watch**.\nConduct and performance will be closely monitored by leadership.`,
      'Termination':         `${target} has been **terminated** from the Texas State Management Staff Team.`,
      'Suspension':          `${target} has been **suspended** from the Texas State Management Staff Team.`,
    };

    const title = titleMap[punishment] || `${icon}  Staff Infraction — ${punishment}`;
    const desc  = descMap[punishment]  || `${target} has received a formal infraction.`;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(`━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${desc}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      .setColor(color)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: target.user.username, iconURL: target.user.displayAvatarURL({ dynamic: true }) })
      .addFields(
        { name: '👤  Staff Member',     value: `${target}`,                inline: true },
        { name: `${icon}  Punishment`,  value: `**${punishment}**`,        inline: true },
        { name: '📋  Case',             value: caseNum ? `\`#${caseNum}\`` : 'N/A', inline: true },
        { name: '📝  Reason',           value: reason,                     inline: false },
        { name: '🗒️  Notes',            value: notes,                      inline: false },
      )
      .setFooter({ text: `Issued by: ${interaction.user.tag} • ${FOOTER_TEXT}` })
      .setTimestamp();

    const cfg = interaction.client.config;

    const roleMap = {
      'Warning 1': cfg.WARNING_1_ROLE_ID,
      'Warning 2': cfg.WARNING_2_ROLE_ID,
      'Strike 1':  cfg.STRIKE_1_ROLE_ID,
      'Strike 2':  cfg.STRIKE_2_ROLE_ID,
    };

    const roleIdToAssign = roleMap[punishment];
    if (roleIdToAssign) {
      const allInfractionRoleIds = Object.values(roleMap).filter(Boolean);
      const rolesToRemove = allInfractionRoleIds.filter(id => id !== roleIdToAssign && target.roles.cache.has(id));
      if (rolesToRemove.length) {
        await target.roles.remove(rolesToRemove).catch(console.error);
      }
      await target.roles.add(roleIdToAssign).catch(console.error);
    }

    let msg;
    if (cfg.INFRACTION_CHANNEL_ID) {
      const ch = interaction.client.channels.cache.get(cfg.INFRACTION_CHANNEL_ID)
        || await interaction.client.channels.fetch(cfg.INFRACTION_CHANNEL_ID).catch(() => null);
      if (ch) msg = await ch.send({ content: `${target}`, embeds: [embed] });
    } else {
      msg = await interaction.channel.send({ embeds: [embed] });
    }

    if (msg) {
      await msg.startThread({ name: `Evidence — Case #${caseNum || 'N/A'}` }).catch(() => {});
    }

    const isWarningPunishment = /warning/i.test(punishment);

    if (isWarningPunishment) {
      await target.send(`You have been warned for: ${reason}`).catch(() => {});
    } else {
      await target.send({
        embeds: [new EmbedBuilder()
          .setTitle(`${icon}  Staff Infraction — ${punishment}`)
          .setDescription(`━━━━━━━━━━━━━━━━━━━━━━━━━━━\nYou have received a staff infraction in **Texas State Management**.\nReview the details below. If you believe this is an error, submit an appeal.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
          .setColor(color)
          .addFields(
            { name: `${icon}  Punishment`, value: `**${punishment}**`, inline: true },
            { name: '📋  Case',            value: caseNum ? `\`#${caseNum}\`` : 'N/A', inline: true },
            { name: '📝  Reason',          value: reason,              inline: false },
            { name: '🗒️  Notes',           value: notes,               inline: false },
          )
          .setFooter({ text: FOOTER_TEXT })
          .setTimestamp()],
      }).catch(() => {});
    }

    await sendOutputLog(interaction.client, {
      action: 'Infraction Issued',
      target: `${target.user.tag} (${target.id})`,
      moderator: interaction.user.tag,
      detail: `Punishment: ${punishment}${caseNum ? ` | Case: #${caseNum}` : ''} | Reason: ${reason}`,
      color,
    });

    await interaction.editReply(`✅ Infraction issued to ${target} — **${punishment}**${caseNum ? ` — Case \`#${caseNum}\`` : ''}.`);
  },
};
