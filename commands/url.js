const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { UploadFileUgu, TelegraPh } = require('../lib/uploader');

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
//                    📥 MEDIA HELPERS
// ═══════════════════════════════════════════════════════════
async function getMediaBufferAndExt(message) {
    const m = message.message || {};
    if (m.imageMessage) {
        const stream = await downloadContentFromMessage(m.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.jpg' };
    }
    if (m.videoMessage) {
        const stream = await downloadContentFromMessage(m.videoMessage, 'video');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.mp4' };
    }
    if (m.audioMessage) {
        const stream = await downloadContentFromMessage(m.audioMessage, 'audio');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.mp3' };
    }
    if (m.documentMessage) {
        const stream = await downloadContentFromMessage(m.documentMessage, 'document');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const fileName = m.documentMessage.fileName || 'file.bin';
        const ext = path.extname(fileName) || '.bin';
        return { buffer: Buffer.concat(chunks), ext };
    }
    if (m.stickerMessage) {
        const stream = await downloadContentFromMessage(m.stickerMessage, 'sticker');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.webp' };
    }
    return null;
}

async function getQuotedMediaBufferAndExt(message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    if (!quoted) return null;
    return getMediaBufferAndExt({ message: quoted });
}

// ═══════════════════════════════════════════════════════════
//                    🚀 URL COMMAND
// ═══════════════════════════════════════════════════════════
async function urlCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🔗');

        // 📥 Get media (current or quoted)
        let media = await getMediaBufferAndExt(message);
        if (!media) media = await getQuotedMediaBufferAndExt(message);

        // ❌ No media
        if (!media) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('🔗 ᴜʀʟ ᴜᴘʟᴏᴀᴅᴇʀ', [
                    '📌 ʜᴏᴡ ᴛᴏ ᴜꜱᴇ :',
                    '• Send or reply to media',
                    '━━━━━━━━━━━━━━━━━━',
                    '🎯 ꜱᴜᴘᴘᴏʀᴛᴇᴅ :',
                    '• 🖼️ Image',
                    '• 🎬 Video',
                    '• 🎵 Audio',
                    '• 📎 Sticker',
                    '• 📄 Document'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await addReaction(sock, message, '🔄');

        // 💾 Save to temp
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `${Date.now()}${media.ext}`);
        fs.writeFileSync(tempPath, media.buffer);

        // 📤 Upload
        let url = '';
        try {
            if (media.ext === '.jpg' || media.ext === '.png' || media.ext === '.webp') {
                try {
                    url = await TelegraPh(tempPath);
                } catch {
                    const res = await UploadFileUgu(tempPath);
                    url = typeof res === 'string' ? res : (res.url || res.url_full || JSON.stringify(res));
                }
            } else {
                const res = await UploadFileUgu(tempPath);
                url = typeof res === 'string' ? res : (res.url || res.url_full || JSON.stringify(res));
            }
        } finally {
            setTimeout(() => {
                try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch {}
            }, 2000);
        }

        // ❌ Upload failed
        if (!url) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('❌ ᴜᴘʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ', [
                    '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ᴜᴘʟᴏᴀᴅ ᴍᴇᴅɪᴀ',
                    '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // ✅ Success
        await addReaction(sock, message, '✅');

        const typeEmoji = media.ext === '.jpg' || media.ext === '.png' ? '🖼️'
            : media.ext === '.mp4' ? '🎬'
            : media.ext === '.mp3' ? '🎵'
            : media.ext === '.webp' ? '📎'
            : '📄';

        await sock.sendMessage(chatId, {
            text: box('✅ ᴜʀʟ ɢᴇɴᴇʀᴀᴛᴇᴅ', [
                `${typeEmoji} ᴛʏᴘᴇ : ${media.ext.replace('.', '').toUpperCase()}`,
                `📏 ꜱɪᴢᴇ : ${(media.buffer.length / 1024).toFixed(2)} KB`,
                '━━━━━━━━━━━━━━━━━━',
                '🔗 ʟɪɴᴋ :',
                url
            ]),
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('[URL] error:', error?.message || error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [
                '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ᴄᴏɴᴠᴇʀᴛ ᴍᴇᴅɪᴀ',
                '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = urlCommand;