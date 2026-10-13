const { MessageFlags } = require('discord.js');

const REGULATIONS = {
  discord: `**1. Respect & Professionalism**
- Treat all members and staff with respect.
- Harassment, bullying, discrimination, hate speech, and targeted abuse are prohibited.
- Do not provoke arguments, start unnecessary drama, or disrupt the community.

**2. Discord Terms of Service**
- All members must comply with the [Discord Terms of Service](https://discord.com/terms).
- All members must follow the [Discord Community Guidelines](https://discord.com/guidelines).
- Violations of Discord policies are prohibited.

**3. Appropriate Content**
- Do not post NSFW, sexually explicit, or otherwise prohibited content.
- Threats, graphic content, and malicious content are prohibited.
- Do not share personal information belonging to yourself or others without appropriate consent.

**4. Chat Regulations**
- No spam, message flooding, or excessive use of capital letters.
- Do not repeatedly ping members or staff without a valid reason.
- Keep conversations in their appropriate channels.
- Unauthorised advertising, invite links, and unsolicited promotions are prohibited.

**5. Voice Channel Regulations**
- No microphone spamming, soundboard abuse, or excessive background noise.
- Do not interrupt meetings, interviews, training sessions, or official briefings.
- Respect staff instructions during organised activities.

**6. Advertising & Partnerships**
- Advertising is only permitted in designated channels with staff authorisation.
- Partnerships must be arranged through the appropriate management team.
- Unsolicited direct messages advertising other servers or services are prohibited.

**7. Staff & Moderation**
- Follow reasonable instructions from authorised staff.
- Do not impersonate staff, developers, or department leadership.
- Do not abuse tickets, reports, or moderation systems.
- Staff decisions may be appealed through the appropriate procedure.

**8. Privacy & Security**
- Do not distribute malicious links, harmful files, or phishing attempts.
- Do not attempt to compromise accounts, bots, or server systems.
- Do not share confidential staff information without appropriate authorisation.

**9. Punishments**
Depending on severity and frequency, punishments may include warnings, message deletion, timeout, kick, temporary ban, or permanent ban.
- Severe violations may result in immediate removal.
- Staff should consider available evidence and previous violations.

**10. Final Regulations**
By remaining in the Texas State Roleplay Discord server, you agree to follow these regulations, the Discord Terms of Service, and the Discord Community Guidelines.

Staff may address misconduct not explicitly covered by these rules, provided action is consistent with applicable platform policies.

**Texas State Roleplay — Professionalism. Realism. Community.**`,
  game: `§1 — General Regulations

1.1 — Treat all members, staff, and roleplayers with respect.

1.2 — Harassment, discrimination, hate speech, and targeted abuse are prohibited.

1.3 — Trolling, disrupting scenes, and intentionally ruining roleplay are prohibited.

1.4 — Follow all reasonable instructions given by authorised staff.

1.5 — Exploiting, cheating, glitch abuse, and modified clients used to gain an unfair advantage are prohibited.

§2 — Roleplay Standards

2.1 — Fail Roleplay (FRP): Unrealistic actions that disregard reasonable roleplay standards are prohibited.

2.2 — Random Deathmatch (RDM): Attacking another player without a valid roleplay reason is prohibited.

2.3 — Vehicle Deathmatch (VDM): Intentionally using a vehicle to attack players without valid roleplay justification is prohibited.

2.4 — Metagaming: Using out-of-character information for an in-character advantage is prohibited.

2.5 — Powergaming: Forcing outcomes on other players or performing unrealistic actions without allowing a reasonable response is prohibited.

2.6 — Fear Roleplay: Respond realistically to credible threats and dangerous situations.

2.7 — Combat Logging: Leaving the game to avoid arrest, consequences, or an ongoing scene is prohibited.

2.8 — Scene Interference: Do not interfere with another ongoing scene without a valid roleplay reason.

§3 — Driving Regulations

3.1 — Drive realistically and obey traffic laws unless your scenario reasonably justifies otherwise.

3.2 — Reckless driving must have a valid roleplay purpose and comply with server pursuit regulations.

3.3 — Intentionally ramming vehicles without valid roleplay justification is prohibited.

3.4 — Repeatedly driving at extreme speeds through populated areas without roleplay justification is prohibited.

3.5 — Do not misuse emergency lights or sirens to gain an unfair advantage or impersonate emergency services.

§4 — Law Enforcement Regulations

4.1 — Officers must maintain professionalism and follow their department's standard operating procedures (SOPs).

4.2 — Arrests, searches, citations, and uses of force must have a valid basis under server rules.

4.3 — Unnecessary force, abuse of authority, and unjustified arrests are prohibited.

4.4 — Officers must provide reasonable opportunities for suspects to respond during roleplay.

4.5 — Police impersonation and unauthorised use of restricted department vehicles are prohibited.

4.6 — Pursuits must follow department pursuit policies and server regulations.

§5 — Criminal Roleplay

5.1 — Criminal activity must have a reasonable roleplay purpose and follow server restrictions.

5.2 — Randomly initiating robberies, shootings, or hostage situations without proper roleplay development is prohibited.

5.3 — Hostages must be treated as roleplay participants, not props used to force automatic outcomes.

5.4 — Criminals must allow police and other participants a reasonable opportunity to respond.

5.5 — Exploiting game mechanics to escape arrest or avoid consequences is prohibited.

§6 — Vehicle & Equipment Regulations

6.1 — Use only vehicles authorised for your department or role.

6.2 — Do not use restricted vehicles, equipment, or uniforms without permission.

6.3 — Vehicle liveries and uniforms must be appropriate for the assigned department.

6.4 — Do not abuse vehicle spawning, repair mechanics, or other game features to disrupt roleplay.

§7 — Staff & Department Regulations

7.1 — Staff must act impartially and enforce rules consistently.

7.2 — Staff permissions must only be used for legitimate moderation and server management.

7.3 — Department members must follow their chain of command and relevant SOPs.

7.4 — Abuse of rank, permissions, or departmental authority is prohibited.

7.5 — Staff decisions may be appealed through the designated reporting or appeal process.

§8 — Reporting & Evidence

8.1 — Report rule violations through the designated reporting system.

8.2 — Include relevant evidence, such as video clips or screenshots, whenever possible.

8.3 — False, malicious, or deliberately misleading reports are prohibited.

8.4 — Do not interrupt active roleplay to argue about moderation. Submit an appeal afterward.

§9 — Punishments

Depending on severity, evidence, and previous offences, violations may result in a verbal warning, official warning, kick, temporary suspension, temporary ban, or permanent ban.

Staff should apply punishments consistently and proportionately. Serious or repeated violations may result in escalated penalties.

§10 — Final Authority

10.1 — All members must comply with the Roblox Terms of Use and Roblox Community Standards.

10.2 — Roblox platform rules take precedence over conflicting regulations.

10.3 — Staff may review situations not explicitly covered by these regulations and take proportionate action based on evidence, fairness, and community safety.

10.4 — By participating in Texas State Roleplay, members agree to follow these regulations and applicable Roblox policies.

Official Roblox Terms of Use: https://www.roblox.com/terms
Official Roblox Community Standards: https://about.roblox.com/community-standards

**Texas State Roleplay — Professionalism. Realism. Community.**`,
  'banned-roleplay': `**TEXAS STATE ROLEPLAY | BANNED ROLEPLAY**

**§1 — Prohibited Scenarios**
- Suicide or self-harm roleplay
- Sexual or NSFW roleplay
- Terrorism or extremist propaganda roleplay
- Bomb threats or explosive attack roleplay
- Slavery or human trafficking roleplay
- Drug use or drug trafficking roleplay
- Alcohol consumption or intoxication roleplay
- Hitman or contract-killing roleplay
- Dark RP involving prohibited, exploitative, or inappropriate content
- Political RP involving harassment, hate, or community disruption
- ICE or immigration-enforcement RP without management approval

**§2 — Platform Compliance**
All members must comply with Roblox Terms of Use and Community Standards. Server restrictions may be stricter than platform rules.

Roblox Terms of Use: https://www.roblox.com/terms
Roblox Community Standards: https://about.roblox.com/community-standards

**§3 — Enforcement**
Violations may result in a warning, removal from a scene, kick, temporary ban, or permanent ban depending on severity, evidence, and previous offences. Serious violations may result in immediate removal.

**§4 — Final Notice**
TXRP management may restrict additional scenarios to maintain realistic, professional, and safe roleplay.

**Texas State Roleplay — Professionalism. Realism. Community.**`,
};

function splitContent(content, limit = 1900) {
  const chunks = [];
  let chunk = '';

  for (const line of content.split('\n')) {
    const next = chunk ? `${chunk}\n${line}` : line;
    if (next.length <= limit) {
      chunk = next;
      continue;
    }

    if (chunk) chunks.push(chunk);
    if (line.length > limit) {
      for (let start = 0; start < line.length; start += limit) {
        chunks.push(line.slice(start, start + limit));
      }
      chunk = '';
    } else {
      chunk = line;
    }
  }

  if (chunk) chunks.push(chunk);
  return chunks;
}

module.exports = {
  customID: 'dashboard:regulations',

  async execute(interaction) {
    const content = REGULATIONS[interaction.values[0]];
    if (!content) {
      return interaction.reply({
        content: 'That regulations selection is not available.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const chunks = splitContent(content);
    await interaction.reply({ content: chunks[0], flags: MessageFlags.Ephemeral });
    for (const chunk of chunks.slice(1)) {
      await interaction.followUp({ content: chunk, flags: MessageFlags.Ephemeral });
    }
  },
};