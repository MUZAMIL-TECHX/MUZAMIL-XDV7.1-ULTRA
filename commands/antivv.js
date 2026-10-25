const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { readSessionJson, writeSessionJson } = require('../lib/session_data');
const isOwnerOrSudo = require('../lib/isOwner');

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
//                    💎 VIP DESIGN FRAME (CLEAN)
// ═══════════════════════════════════════════════════════════
function vipBox(title, lines = []) {
    let out = `╭━━━━━━━━━━━━━━━╮\n`;
    out += `   ✦ ${title} ✦\n`;
    out += `╰━━━━━━━━━━━━━━━╯\n`;
    for (const l of lines) out += `▸ ${l}\n`;
    out += `━━━━━━━━━━━━━━━━\n`;
    out += `👑 𝗕𝘆 : 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫`;
    return out;
}

// ═══════════════════════════════════════════════════════════
//                    ⚙️ CONFIG
// ═══════════════════════════════════════════════════════════
function getConfig(sock) {
    return readSessionJson(sock, 'antivv.json', { enabled: false });
}

// ═══════════════════════════════════════════════════════════
//                    🚀 COMMAND HANDLER
// ═══════════════════════════════════════════════════════════
async function antiVvCommand(sock, chatId, message, match) {
    try {
        await addReaction(sock, message, '🛡️');

        const senderId = message.key.participant || message.key.remoteJid;

        if (!message.key.fromMe && !(await isOwnerOrSudo(senderId, sock, chatId))) {
            await addReaction(sock, message, '⛔');
            return sock.sendMessage(chatId, {
                text: vipBox('⛔ 𝙰𝙲𝙲𝙴𝚂𝚂 𝙳𝙴𝙽𝙸𝙴𝙳', [
                    'Only the bot owner can use this command.'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        const config = getConfig(sock);
        const argument = String(match || '').trim().toLowerCase();

        // 📋 Menu
        if (!argument) {
            const status = config.enabled ? '🟢 ON' : '🔴 OFF';
            await addReaction(sock, message, '📋');
            return sock.sendMessage(chatId, {
                text: vipBox('🛡️ 𝙰𝙽𝚃𝙸-𝚅𝙸𝙴𝚆𝙾𝙽𝙲𝙴 𝙼𝙴𝙽𝚄', [
                    `📊 𝚂𝚝𝚊𝚝𝚞𝚜 : ${status}`,
                    '📌 𝚄𝚜𝚊𝚐𝚎 :',
                    '• .antivv on — Enable',
                    '• .antivv off — Disable'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        if (argument !== 'on' && argument !== 'off') {
            await addReaction(sock, message, '❌');
            return sock.sendMessage(chatId, {
                text: vipBox('❌ 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝙾𝙿𝚃𝙸𝙾𝙽', [
                    'Use .antivv on or .antivv off'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        config.enabled = argument === 'on';
        writeSessionJson(sock, 'antivv.json', config);

        await addReaction(sock, message, config.enabled ? '✅' : '🔕');
        return sock.sendMessage(chatId, {
            text: vipBox('🛡️ 𝙰𝙽𝚃𝙸-𝚅𝙸𝙴𝚆𝙾𝙽𝙲𝙴 𝚄𝙿𝙳𝙰𝚃𝙴𝙳', [
                `📊 𝚂𝚝𝚊𝚝𝚞𝚜 : ${config.enabled ? '🟢 ON' : '🔴 OFF'}`,
                `✅ 𝙰𝚌𝚝𝚒𝚘𝚗 : ${config.enabled ? 'Enabled' : 'Disabled'}`
            ]),
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Anti-VV command error:', error);
        await addReaction(sock, message, '❌');
        return sock.sendMessage(chatId, {
            text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                'Something went wrong.',
                'Please try again later.'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

// ═══════════════════════════════════════════════════════════
//                    📦 UNWRAP MESSAGE
// ═══════════════════════════════════════════════════════════
function unwrap(message) {
    let current = message;
    while (current?.ephemeralMessage?.message) current = current.ephemeralMessage.message;
    while (current?.viewOnceMessage?.message) current = current.viewOnceMessage.message;
    while (current?.viewOnceMessageV2?.message) current = current.viewOnceMessageV2.message;
    while (current?.viewOnceMessageV2Extension?.message) current = current.viewOnceMessageV2Extension.message;
    return current || {};
}

// ═══════════════════════════════════════════════════════════
//                    🛡️ VIEWONCE HANDLER
// ═══════════════════════════════════════════════════════════
async function handleAntiVv(sock, message) {
    try {
        const config = getConfig(sock);
        if (!config.enabled || message.key?.fromMe) return false;

        const content = unwrap(message.message);
        const media = content.imageMessage || content.videoMessage || content.audioMessage;
        if (!media || !media.viewOnce) return false;

        const type = content.imageMessage ? 'image' : content.videoMessage ? 'video' : 'audio';
        const stream = await downloadContentFromMessage(media, type);
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);

        const sender = message.key.participant || message.key.remoteJid;
        const senderLabel = `@${String(sender).split('@')[0].split(':')[0]}`;

        const number = String(sock.user?.id || '').split(':')[0].split('@')[0];
        if (!number) return false;
        const destination = `${number}@s.whatsapp.net`;

        const caption = vipBox(`🛡️ 𝙰𝙽𝚃𝙸-𝚅𝙸𝙴𝚆𝙾𝙽𝙲𝙴 ${type.toUpperCase()}`, [
            `👤 𝚂𝚎𝚗𝚍𝚎𝚛 : ${senderLabel}`
        ]);

        const payload = type === 'image'
            ? { image: buffer, caption, mentions: [sender], ...channelInfo }
            : type === 'video'
                ? { video: buffer, caption, mentions: [sender], ...channelInfo }
                : { audio: buffer, mimetype: media.mimetype || 'audio/ogg', caption, mentions: [sender], ...channelInfo };

        await sock.sendMessage(destination, payload);
        return true;
    } catch (error) {
        console.error('Anti-ViewOnce error:', error.message);
        return false;
    }
}

module.exports = { antiVvCommand, handleAntiVv };