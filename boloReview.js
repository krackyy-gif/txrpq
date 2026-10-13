const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const { hasPerm } = require('../utils/staffHelpers');
const { StaffBolo } = require('../models/staffPortal');
const { runGameCommand } = require('../utils/ingameUserKick');

function getField(embed, name) {
  return embed?.fields?.find(field => field.name === name)?.value ?? null;
}

function updateEmbed(embed, status, reason) {
  const data = embed.toJSON();
  data.color = status === 'Approved' ? 0x2EAD61 : status === 'Denied' ? 0x777777 : 0xD62828;
  data.fields = data.fields.map(field =>
    field.name === 'Review Status'
      ? { ...field, value: status, inline: true }
      : field
  );
  if (reason) data.fields.push({ name: 'Review Note', value: reason.slice(0, 1000), inline: false });
  return EmbedBuilder.from(data);
}

module.exports = {
  customID: 'bolo:',

  async execute(interaction, client) {
    if (!hasPerm(interaction)) {
      return interaction.reply({ content: 'You are not allowed to review Ban BOLOs.', flags: MessageFlags.Ephemeral });
    }

    const [action] = interaction.customId.slice('bolo:'.length).split(':');
    const sourceEmbed = interaction.message.embeds[0];
    if (!sourceEmbed || getField(sourceEmbed, 'Type') !== 'Ban BOLO') {
      return interaction.reply({ content: 'This is not a Ban BOLO entry.', flags: MessageFlags.Ephemeral });
    }
    if (getField(sourceEmbed, 'Review Status') !== 'Pending') {
      return interaction.reply({ content: 'This Ban BOLO has already been reviewed.', flags: MessageFlags.Ephemeral });
    }
    const boloId = getField(sourceEmbed, 'Portal BOLO ID');
    const bolo = boloId
      ? await StaffBolo.findOne({ _id: boloId, guildId: interaction.guildId, status: 'Pending' })
      : null;
    if (boloId && !bolo) {
      return interaction.reply({ content: 'This Ban BOLO has already been reviewed.', flags: MessageFlags.Ephemeral });
    }
    if (action === 'approve' && getField(sourceEmbed, 'Requester ID') === interaction.user.id) {
      return interaction.reply({ content: 'A different authorized staff member must approve this Ban BOLO.', flags: MessageFlags.Ephemeral });
    }

    if (action === 'deny') {
      const modal = new ModalBuilder()
        .setCustomId(`bolo_review_denial:${interaction.message.id}`)
        .setTitle('Deny Ban BOLO')
        .addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Why is this BOLO being denied?')
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(5)
            .setMaxLength(500)
            .setRequired(true)
        ));
      return interaction.showModal(modal);
    }

    if (action !== 'approve') return;

    const username = getField(sourceEmbed, 'Player');
    const reason = getField(sourceEmbed, 'Reason');
    if (!username || !reason || !client.config.ERLC_SERVER_KEY) {
      return interaction.reply({ content: 'The player, reason, or ER:LC server key is missing; no ban was issued.', flags: MessageFlags.Ephemeral });
    }

    let lockedBolo = null;
    if (bolo) {
      lockedBolo = await StaffBolo.findOneAndUpdate(
        { _id: bolo._id, status: 'Pending' },
        { $set: { status: 'Reviewing', reviewedById: interaction.user.id, reviewedByTag: interaction.user.tag } },
        { new: true },
      );
      if (!lockedBolo) {
        return interaction.reply({ content: 'Another reviewer already handled this Ban BOLO.', flags: MessageFlags.Ephemeral });
      }
    }

    await interaction.deferUpdate();
    try {
      await runGameCommand(client, `:ban ${username} ${reason}`);
      if (lockedBolo) {
        lockedBolo.status = 'Approved';
        lockedBolo.erlcActionAt = new Date();
        await lockedBolo.save();
      }

      await interaction.message.edit({
        embeds: [updateEmbed(sourceEmbed, 'Approved', `Approved by ${interaction.user.tag}; ER:LC ban issued.`)],
        components: [],
      });

      const requesterId = getField(sourceEmbed, 'Requester ID');
      if (requesterId) {
        await interaction.channel.send({
          content: `<@${requesterId}> your Ban BOLO for **${username}** was approved and sent to ER:LC.`,
          allowedMentions: { users: [requesterId] },
        });
      }
    } catch (error) {
      console.error('Ban BOLO approval failed:', error.response?.data || error.message);
      if (lockedBolo) {
        lockedBolo.status = 'Pending';
        lockedBolo.reviewedById = '';
        lockedBolo.reviewedByTag = '';
        await lockedBolo.save().catch(() => {});
      }
      await interaction.message.edit({
        embeds: [updateEmbed(sourceEmbed, 'Pending', `Ban failed; no successful ER:LC response (${error.response?.status || 'network error'}).`)],
      });
      await interaction.channel.send('ER:LC did not confirm the ban. The Ban BOLO remains pending review.');
    }
  },
};