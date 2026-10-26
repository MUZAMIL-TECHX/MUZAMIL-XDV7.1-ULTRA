const { getSessionSettings } = require('../lib/session_data');

// ===============================
// 🎯 CHANNEL INFO (FORWARD OFF)
// ===============================
const channelInfo = {
    contextInfo: {
        forwardingScore: 0,
        isForwarded: false
    }
};

// Helper function to add reaction
async function addReaction(sock, message, emoji) {
    try {
        await sock.sendMessage(message.key.remoteJid, {
            react: { text: emoji, key: message.key }
        });
    } catch (error) {
        console.error('Reaction error:', error);
    }
}

async function ownerCommand(sock, chatId, message) {
    try {
        // 👑 Reaction
        if (message) await addReaction(sock, message, '👑');

        const sessionSettings = getSessionSettings(sock);
        const number = sessionSettings.ownerNumber;
        const name = sessionSettings.ownerName;
        const botName = sessionSettings.botName;
        
        // 🪪 vCard Format (Contact Card)
        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${name}\n` +
                      `ORG:${botName}\n` +
                      `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\n` +
                      'END:VCARD';

        // 📤 Send Contact Card (Forward OFF)
        await sock.sendMessage(chatId, {
            contacts: {
                displayName: name,
                contacts: [{ vcard }]
            },
            ...channelInfo
        }, message ? { quoted: message } : {});

        // 📝 Send Text Info (VIP Design)
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
            ...channelInfo
        }, message ? { quoted: message } : {});

        // ✅ Done
        if (message) await addReaction(sock, message, '✅');

    } catch (error) {
        console.error('Owner command error:', error);
        if (message) await addReaction(sock, message, '❌');
        
        await sock.sendMessage(chatId, {
            text: `╭━━━━━━━━━━━━━━━━━━╮
┃  ✦ ❌ ᴇʀʀᴏʀ
╰━━━━━━━━━━━━━━━━━━╯

▸ 🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ʟᴏᴀᴅ ᴄᴏɴᴛᴀᴄᴛ

━━━━━━━━━━━━━━━━━━━━
   👑 𝗕𝘆 : 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫`,
            ...channelInfo
        });
    }
}

module.exports = ownerCommand;
