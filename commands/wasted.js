const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

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
//                    ⚰️ WASTED COMMAND
// ═══════════════════════════════════════════════════════════
async function wastedCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '⚰️');

        let userToWaste;

        // Mentioned user
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToWaste = message.message.extendedTextMessage.contextInfo.participant;
        }

        // ❌ No target
        if (!userToWaste) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('⚰️ ᴡᴀꜱᴛᴇᴅ', [
                    '📌 ᴜꜱᴀɢᴇ :',
                    '• .wasted @user',
                    '• Reply to a message + .wasted',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴛᴀʀɢᴇᴛ ᴜꜱᴇʀ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await addReaction(sock, message, '🎨');

        // 🖼️ Get profile picture
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToWaste, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg';
        }

        // 🎨 Generate wasted image
        const wastedResponse = await axios.get(
            `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`,
            { responseType: 'arraybuffer', timeout: 15000 }
        );

        const targetName = userToWaste.split('@')[0];

        // 📤 Send result
        await sock.sendMessage(chatId, {
            image: Buffer.from(wastedResponse.data),
            caption: box('⚰️ ᴡᴀꜱᴛᴇᴅ', [
                `👤 ᴛᴀʀɢᴇᴛ : @${targetName}`,
                '💀 ꜱᴛᴀᴛᴜꜱ : ʀᴇꜱᴛ ɪɴ ᴘɪᴇᴄᴇꜱ',
                '━━━━━━━━━━━━━━━━━━',
                '🎯 ɴɪᴄᴇʟʏ ᴅᴏɴᴇ!'
            ]),
            mentions: [userToWaste],
            ...channelInfo
        }, { quoted: message });

        await addReaction(sock, message, '✅');

    } catch (error) {
        console.error('Error in wasted command:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ꜰᴀɪʟᴇᴅ', [
                '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ᴄʀᴇᴀᴛᴇ ᴡᴀꜱᴛᴇᴅ ɪᴍᴀɢᴇ',
                '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = wastedCommand;