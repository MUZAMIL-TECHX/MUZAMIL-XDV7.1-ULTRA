const isAdmin = require('../lib/isAdmin');

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
//                    🔇 MUTE COMMAND
// ═══════════════════════════════════════════════════════════
async function muteCommand(sock, chatId, senderId, message, durationInMinutes) {
    try {
        await addReaction(sock, message, '🔇');

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

        // 🔐 Admin checks
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await addReaction(sock, message, '⛔');
            await sock.sendMessage(chatId, {
                text: box('⛔ ʙᴏᴛ ɴᴏᴛ ᴀᴅᴍɪɴ', [
                    'ᴘʟᴇᴀꜱᴇ ᴍᴀᴋᴇ ᴛʜᴇ ʙᴏᴛ ᴀɴ ᴀᴅᴍɪɴ ꜰɪʀꜱᴛ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await addReaction(sock, message, '⛔');
            await sock.sendMessage(chatId, {
                text: box('⛔ ᴀᴅᴍɪɴ ᴏɴʟʏ', [
                    'ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴꜱ ᴄᴀɴ ᴜꜱᴇ ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // 🔇 Mute the group
        await sock.groupSettingUpdate(chatId, 'announcement');

        if (durationInMinutes !== undefined && durationInMinutes > 0) {
            const durationInMilliseconds = durationInMinutes * 60 * 1000;

            await addReaction(sock, message, '🔇');
            await sock.sendMessage(chatId, {
                text: box('🔇 ɢʀᴏᴜᴘ ᴍᴜᴛᴇᴅ', [
                    '📢 ꜱᴛᴀᴛᴜꜱ : ɢʀᴏᴜᴘ ɪꜱ ɴᴏᴡ ʀᴇᴀᴅ-ᴏɴʟʏ',
                    `⏱️ ᴅᴜʀᴀᴛɪᴏɴ : ${durationInMinutes} ᴍɪɴᴜᴛᴇꜱ`,
                    '🔓 ᴀᴜᴛᴏ-ᴜɴᴍᴜᴛᴇ ᴇɴᴀʙʟᴇᴅ'
                ]),
                ...channelInfo
            }, { quoted: message });

            // ⏱️ Auto-unmute
            setTimeout(async () => {
                try {
                    await sock.groupSettingUpdate(chatId, 'not_announcement');
                    await sock.sendMessage(chatId, {
                        text: box('🔊 ɢʀᴏᴜᴘ ᴜɴᴍᴜᴛᴇᴅ', [
                            '📢 ꜱᴛᴀᴛᴜꜱ : ɢʀᴏᴜᴘ ɪꜱ ɴᴏᴡ ᴏᴘᴇɴ',
                            `⏱️ ᴅᴜʀᴀᴛɪᴏɴ ᴄᴏᴍᴘʟᴇᴛᴇ : ${durationInMinutes} ᴍɪɴᴜᴛᴇꜱ`,
                            '💬 ᴀʟʟ ᴍᴇᴍʙᴇʀꜱ ᴄᴀɴ ꜱᴇɴᴅ ᴍᴇꜱꜱᴀɢᴇꜱ'
                        ]),
                        ...channelInfo
                    });
                } catch (unmuteError) {
                    console.error('Error unmuting group:', unmuteError);
                }
            }, durationInMilliseconds);
        } else {
            await addReaction(sock, message, '🔇');
            await sock.sendMessage(chatId, {
                text: box('🔇 ɢʀᴏᴜᴘ ᴍᴜᴛᴇᴅ', [
                    '📢 ꜱᴛᴀᴛᴜꜱ : ɢʀᴏᴜᴘ ɪꜱ ɴᴏᴡ ʀᴇᴀᴅ-ᴏɴʟʏ',
                    '💬 ᴏɴʟʏ ᴀᴅᴍɪɴꜱ ᴄᴀɴ ꜱᴇɴᴅ ᴍᴇꜱꜱᴀɢᴇꜱ',
                    '🔓 ᴜꜱᴇ .unmute ᴛᴏ ᴏᴘᴇɴ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error muting/unmuting the group:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ꜰᴀɪʟᴇᴅ', [
                '🔴 ᴄᴏᴜʟᴅ ɴᴏᴛ ᴍᴜᴛᴇ/ᴜɴᴍᴜᴛᴇ ɢʀᴏᴜᴘ',
                '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = muteCommand;