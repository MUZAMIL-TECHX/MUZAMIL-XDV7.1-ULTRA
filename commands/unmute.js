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

// ═══════════════════════════════════════════════════════════
//                    🛠️ HELPERS
// ═══════════════════════════════════════════════════════════
async function addReaction(sock, message, emoji) {
    try {
        await sock.sendMessage(message.key.remoteJid, {
            react: { text: emoji, key: message.key }
        });
    } catch (error) {
        console.error('Reaction error:', error);
    }
}

// ═══════════════════════════════════════════════════════════
//                    💎 VIP DESIGN FRAME (BOLD CLEAN)
// ═══════════════════════════════════════════════════════════
function box(title, lines = []) {
    let out = `╭━━━━━━━━━━━━━━━━━━╮\n`;
    out += `┃  ✦ ${title}\n`;
    out += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;
    for (const l of lines) out += `▸ ${l}\n`;
    out += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    out += `   👑 𝗕𝘆 : 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫`;
    return out;
}

// ═══════════════════════════════════════════════════════════
//                    🔊 UNMUTE COMMAND
// ═══════════════════════════════════════════════════════════
async function unmuteCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🔊');

        // ❌ Not a group
        if (!chatId.endsWith('@g.us')) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('❌ ɢʀᴏᴜᴘ ᴏɴʟʏ', [
                    'ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ ɪꜱ ꜰᴏʀ ɢʀᴏᴜᴘꜱ ᴏɴʟʏ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await sock.groupSettingUpdate(chatId, 'not_announcement');

        await addReaction(sock, message, '✅');
        await sock.sendMessage(chatId, {
            text: box('🔊 ɢʀᴏᴜᴘ ᴜɴᴍᴜᴛᴇᴅ', [
                '📢 ꜱᴛᴀᴛᴜꜱ : ɢʀᴏᴜᴘ ɪꜱ ɴᴏᴡ ᴏᴘᴇɴ',
                '💬 ᴀʟʟ ᴍᴇᴍʙᴇʀꜱ ᴄᴀɴ ꜱᴇɴᴅ ᴍᴇꜱꜱᴀɢᴇꜱ',
                '✅ ᴅᴏɴᴇ'
            ]),
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Unmute command error:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ꜰᴀɪʟᴇᴅ', [
                '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ᴜɴᴍᴜᴛᴇ ɢʀᴏᴜᴘ',
                '💡 ᴍᴀᴋᴇ ꜱᴜʀᴇ ʙᴏᴛ ɪꜱ ᴀᴅᴍɪɴ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = unmuteCommand;