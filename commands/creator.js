const settings = require('../settings');
const { getSessionSettings } = require('../lib/session_data');

// ═══════════════════════════════════════════════════════════
//                    🎯 CHANNEL INFO (FORWARD ON)
// ═══════════════════════════════════════════════════════════
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363426106687970@newsletter',
            newsletterName: '𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫',
            serverMessageId: -1
        }
    }
};

async function creatorCommand(sock, chatId, message) {
    try {
        // 👑 Add Reaction
        await sock.sendMessage(chatId, {
            react: {
                text: '👑',
                key: message.key
            }
        });

        // 📱 Contact Info
        const sessionSettings = getSessionSettings(sock);
        const number = sessionSettings.ownerNumber;
        const name = sessionSettings.ownerName;
        const botName = sessionSettings.botName;
        const jid = `${number}@s.whatsapp.net`;

        // 🪪 vCard Format
        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${name}\n` +
                      `ORG:${botName}\n` +
                      `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\n` +
                      'END:VCARD';

        // 📤 Send Contact Card (Forwarded)
        await sock.sendMessage(chatId, {
            contacts: {
                displayName: name,
                contacts: [{ vcard }]
            },
            ...channelInfo // ✅ Forward ON
        }, { quoted: message });

        // 📝 Send Text Info (Optional - VIP Box)
        const replyText = 
`╭━━━━━━━━━━━━━━━━━━╮
┃  ✦ 👑 ᴄʀᴇᴀᴛᴏʀ
╰━━━━━━━━━━━━━━━━━━╯

▸ 👤 ɴᴀᴍᴇ : ${name}
▸ 📱 ɴᴜᴍʙᴇʀ : ${number}

━━━━━━━━━━━━━━━━━━━━
▸ 🔗 ᴡʜᴀᴛꜱᴀᴘᴘ ᴄʜᴀɴɴᴇʟ :
▸ https://whatsapp.com/channel/0029VbCkm3rAe5VzCYLtNb2u

━━━━━━━━━━━━━━━━━━━━
   👑 𝗕𝘆 : ${botName}`;

        await sock.sendMessage(chatId, {
            text: replyText,
            ...channelInfo // ✅ Forward ON
        }, { quoted: message });

    } catch (error) {
        console.error('Creator command error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to send contact.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = creatorCommand;
