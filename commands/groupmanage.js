const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

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
//                    🔐 GROUP + ADMIN CHECK
// ═══════════════════════════════════════════════════════════
async function ensureGroupAndAdmin(sock, chatId, senderId, message) {
    const isGroup = chatId.endsWith('@g.us');

    if (!isGroup) {
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ɢʀᴏᴜᴘ ᴏɴʟʏ', [
                'ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜꜱᴇᴅ ɪɴ ɢʀᴏᴜᴘꜱ'
            ]),
            ...channelInfo
        }, { quoted: message });
        return { ok: false };
    }

    const isAdmin = require('../lib/isAdmin');
    const adminStatus = await isAdmin(sock, chatId, senderId);

    if (!adminStatus.isBotAdmin) {
        await addReaction(sock, message, '⛔');
        await sock.sendMessage(chatId, {
            text: box('⛔ ʙᴏᴛ ɴᴏᴛ ᴀᴅᴍɪɴ', [
                'ᴘʟᴇᴀꜱᴇ ᴍᴀᴋᴇ ᴛʜᴇ ʙᴏᴛ ᴀɴ ᴀᴅᴍɪɴ ꜰɪʀꜱᴛ'
            ]),
            ...channelInfo
        }, { quoted: message });
        return { ok: false };
    }

    if (!adminStatus.isSenderAdmin) {
        await addReaction(sock, message, '⛔');
        await sock.sendMessage(chatId, {
            text: box('⛔ ᴀᴅᴍɪɴ ᴏɴʟʏ', [
                'ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴꜱ ᴄᴀɴ ᴜꜱᴇ ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ'
            ]),
            ...channelInfo
        }, { quoted: message });
        return { ok: false };
    }

    return { ok: true };
}

// ═══════════════════════════════════════════════════════════
//                    📝 SET GROUP DESCRIPTION
// ═══════════════════════════════════════════════════════════
async function setGroupDescription(sock, chatId, senderId, text, message) {
    try {
        await addReaction(sock, message, '📝');
        const check = await ensureGroupAndAdmin(sock, chatId, senderId, message);
        if (!check.ok) return;

        const desc = (text || '').trim();
        if (!desc) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('📝 ꜱᴇᴛ ɢʀᴏᴜᴘ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ', [
                    '📌 ᴜꜱᴀɢᴇ : .setgdesc <description>',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .setgdesc Welcome to our group!',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴘʀᴏᴠɪᴅᴇ ᴛʜᴇ ɴᴇᴡ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await sock.groupUpdateDescription(chatId, desc);
        await addReaction(sock, message, '✅');
        await sock.sendMessage(chatId, {
            text: box('✅ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ ᴜᴘᴅᴀᴛᴇᴅ', [
                '📝 ꜱᴛᴀᴛᴜꜱ : ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ ᴜᴘᴅᴀᴛᴇᴅ',
                `💬 ɴᴇᴡ ᴛᴇxᴛ : ${desc.length > 50 ? desc.substring(0, 47) + '...' : desc}`
            ]),
            ...channelInfo
        }, { quoted: message });

    } catch (e) {
        console.error('setGroupDescription error:', e);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ꜰᴀɪʟᴇᴅ', [
                '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ',
                '💡 ᴄʜᴇᴄᴋ ʙᴏᴛ ᴘᴇʀᴍɪꜱꜱɪᴏɴꜱ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

// ═══════════════════════════════════════════════════════════
//                    ✏️ SET GROUP NAME
// ═══════════════════════════════════════════════════════════
async function setGroupName(sock, chatId, senderId, text, message) {
    try {
        await addReaction(sock, message, '✏️');
        const check = await ensureGroupAndAdmin(sock, chatId, senderId, message);
        if (!check.ok) return;

        const name = (text || '').trim();
        if (!name) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('✏️ ꜱᴇᴛ ɢʀᴏᴜᴘ ɴᴀᴍᴇ', [
                    '📌 ᴜꜱᴀɢᴇ : .setgname <new name>',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .setgname My Awesome Group',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴘʀᴏᴠɪᴅᴇ ᴛʜᴇ ɴᴇᴡ ɴᴀᴍᴇ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await sock.groupUpdateSubject(chatId, name);
        await addReaction(sock, message, '✅');
        await sock.sendMessage(chatId, {
            text: box('✅ ɴᴀᴍᴇ ᴜᴘᴅᴀᴛᴇᴅ', [
                `🏷️ ɴᴇᴡ ɴᴀᴍᴇ : ${name}`,
                '📝 ꜱᴛᴀᴛᴜꜱ : ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ ᴜᴘᴅᴀᴛᴇᴅ'
            ]),
            ...channelInfo
        }, { quoted: message });

    } catch (e) {
        console.error('setGroupName error:', e);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ꜰᴀɪʟᴇᴅ', [
                '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ɴᴀᴍᴇ',
                '💡 ᴄʜᴇᴄᴋ ʙᴏᴛ ᴘᴇʀᴍɪꜱꜱɪᴏɴꜱ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

// ═══════════════════════════════════════════════════════════
//                    🖼️ SET GROUP PHOTO
// ═══════════════════════════════════════════════════════════
async function setGroupPhoto(sock, chatId, senderId, message) {
    try {
        await addReaction(sock, message, '🖼️');
        const check = await ensureGroupAndAdmin(sock, chatId, senderId, message);
        if (!check.ok) return;

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quoted?.imageMessage || quoted?.stickerMessage;

        if (!imageMessage) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('🖼️ ꜱᴇᴛ ɢʀᴏᴜᴘ ᴘʜᴏᴛᴏ', [
                    '📌 ᴜꜱᴀɢᴇ :',
                    '• Reply to image + .setgpp',
                    '• Reply to sticker + .setgpp',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴍᴜꜱᴛ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ/ꜱᴛɪᴄᴋᴇʀ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const imgPath = path.join(tmpDir, `gpp_${Date.now()}.jpg`);
        fs.writeFileSync(imgPath, buffer);

        await sock.updateProfilePicture(chatId, { url: imgPath });
        try { fs.unlinkSync(imgPath); } catch (_) {}

        await addReaction(sock, message, '✅');
        await sock.sendMessage(chatId, {
            text: box('✅ ᴘʜᴏᴛᴏ ᴜᴘᴅᴀᴛᴇᴅ', [
                '🖼️ ɢʀᴏᴜᴘ ᴘʜᴏᴛᴏ : ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ ᴜᴘᴅᴀᴛᴇᴅ',
                '📝 ꜱᴛᴀᴛᴜꜱ : ᴅᴏɴᴇ'
            ]),
            ...channelInfo
        }, { quoted: message });

    } catch (e) {
        console.error('setGroupPhoto error:', e);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ꜰᴀɪʟᴇᴅ', [
                '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ɢʀᴏᴜᴘ ᴘʜᴏᴛᴏ',
                '💡 ᴄʜᴇᴄᴋ ʙᴏᴛ ᴘᴇʀᴍɪꜱꜱɪᴏɴꜱ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = {
    setGroupDescription,
    setGroupName,
    setGroupPhoto
};