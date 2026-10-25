const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');
const { readSessionJson, writeSessionJson } = require('../lib/session_data');

const messageStore = new Map();
const BASE_TEMP_MEDIA_DIR = path.join(__dirname, '../tmp');
const TEMP_MEDIA_DIR = BASE_TEMP_MEDIA_DIR;

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

// Ensure tmp dir exists
if (!fs.existsSync(BASE_TEMP_MEDIA_DIR)) {
    fs.mkdirSync(BASE_TEMP_MEDIA_DIR, { recursive: true });
}

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
//                    🧹 TEMP FOLDER UTILS
// ═══════════════════════════════════════════════════════════
const getFolderSizeInMB = (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);
        let totalSize = 0;
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                totalSize += fs.statSync(filePath).size;
            }
        }
        return totalSize / (1024 * 1024);
    } catch (err) {
        console.error('Error getting folder size:', err);
        return 0;
    }
};

const cleanTempFolderIfLarge = () => {
    try {
        const sizeMB = getFolderSizeInMB(TEMP_MEDIA_DIR);
        if (sizeMB > 200) {
            const files = fs.readdirSync(TEMP_MEDIA_DIR);
            for (const file of files) {
                const filePath = path.join(TEMP_MEDIA_DIR, file);
                fs.unlinkSync(filePath);
            }
        }
    } catch (err) {
        console.error('Temp cleanup error:', err);
    }
};

setInterval(cleanTempFolderIfLarge, 60 * 1000);

// ═══════════════════════════════════════════════════════════
//                    ⚙️ CONFIG LOAD/SAVE
// ═══════════════════════════════════════════════════════════
function loadAntideleteConfig(sock) {
    return readSessionJson(sock, 'antidelete.json', { enabled: false });
}

function saveAntideleteConfig(sock, config) {
    try {
        writeSessionJson(sock, 'antidelete.json', config);
    } catch (err) {
        console.error('Config save error:', err);
    }
}

const isOwnerOrSudo = require('../lib/isOwner');

// ═══════════════════════════════════════════════════════════
//                    🚀 COMMAND HANDLER
// ═══════════════════════════════════════════════════════════
async function handleAntideleteCommand(sock, chatId, message, match) {
    try {
        await addReaction(sock, message, '🛡️');

        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!message.key.fromMe && !isOwner) {
            await addReaction(sock, message, '⛔');
            return sock.sendMessage(chatId, {
                text: vipBox('⛔ 𝙰𝙲𝙲𝙴𝚂𝚂 𝙳𝙴𝙽𝙸𝙴𝙳', [
                    'Only the bot owner can use this command.'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        const config = loadAntideleteConfig(sock);

        // ❌ No argument → show menu
        if (!match) {
            const status = config.enabled ? '🟢 ON' : '🔴 OFF';
            await addReaction(sock, message, '📋');
            return sock.sendMessage(chatId, {
                text: vipBox('🛡️ 𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴 𝙼𝙴𝙽𝚄', [
                    `📊 𝚂𝚝𝚊𝚝𝚞𝚜 : ${status}`,
                    '📌 𝚄𝚜𝚊𝚐𝚎 :',
                    '• .antidelete on — Enable',
                    '• .antidelete off — Disable'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ✅ ON / OFF
        if (match === 'on') {
            config.enabled = true;
            await addReaction(sock, message, '✅');
        } else if (match === 'off') {
            config.enabled = false;
            await addReaction(sock, message, '🔕');
        } else {
            await addReaction(sock, message, '❌');
            return sock.sendMessage(chatId, {
                text: vipBox('❌ 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝙲𝙾𝙼𝙼𝙰𝙽𝙳', [
                    'Use .antidelete to see usage.'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        saveAntideleteConfig(sock, config);
        const status = match === 'on' ? '🟢 ON' : '🔴 OFF';

        return sock.sendMessage(chatId, {
            text: vipBox('🛡️ 𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴 𝚄𝙿𝙳𝙰𝚃𝙴𝙳', [
                `📊 𝚂𝚝𝚊𝚝𝚞𝚜 : ${status}`,
                `✅ 𝙰𝚌𝚝𝚒𝚘𝚗 : ${match === 'on' ? 'Enabled' : 'Disabled'}`
            ]),
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Antidelete command error:', error);
        await addReaction(sock, message, '❌');
        return sock.sendMessage(chatId, {
            text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                'Error processing command.'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

// ═══════════════════════════════════════════════════════════
//                    📥 STORE MESSAGES
// ═══════════════════════════════════════════════════════════
async function storeMessage(sock, message) {
    try {
        const config = loadAntideleteConfig(sock);
        if (!config.enabled) return;

        if (!message.key?.id) return;

        const messageId = message.key.id;
        let content = '';
        let mediaType = '';
        let mediaPath = '';
        let isViewOnce = false;

        const sender = message.key.participant || message.key.remoteJid;

        const viewOnceContainer = message.message?.viewOnceMessageV2?.message || message.message?.viewOnceMessage?.message;

        if (viewOnceContainer) {
            if (viewOnceContainer.imageMessage) {
                mediaType = 'image';
                content = viewOnceContainer.imageMessage.caption || '';
                const buffer = await downloadContentFromMessage(viewOnceContainer.imageMessage, 'image');
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
                await writeFile(mediaPath, buffer);
                isViewOnce = true;
            } else if (viewOnceContainer.videoMessage) {
                mediaType = 'video';
                content = viewOnceContainer.videoMessage.caption || '';
                const buffer = await downloadContentFromMessage(viewOnceContainer.videoMessage, 'video');
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
                await writeFile(mediaPath, buffer);
                isViewOnce = true;
            }
        } else if (message.message?.conversation) {
            content = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            content = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage) {
            mediaType = 'image';
            content = message.message.imageMessage.caption || '';
            const buffer = await downloadContentFromMessage(message.message.imageMessage, 'image');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.stickerMessage) {
            mediaType = 'sticker';
            const buffer = await downloadContentFromMessage(message.message.stickerMessage, 'sticker');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.videoMessage) {
            mediaType = 'video';
            content = message.message.videoMessage.caption || '';
            const buffer = await downloadContentFromMessage(message.message.videoMessage, 'video');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.audioMessage) {
            mediaType = 'audio';
            const mime = message.message.audioMessage.mimetype || '';
            const ext = mime.includes('mpeg') ? 'mp3' : (mime.includes('ogg') ? 'ogg' : 'mp3');
            const buffer = await downloadContentFromMessage(message.message.audioMessage, 'audio');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
            await writeFile(mediaPath, buffer);
        }

        messageStore.set(messageId, {
            content,
            mediaType,
            mediaPath,
            sender,
            group: message.key.remoteJid.endsWith('@g.us') ? message.key.remoteJid : null,
            timestamp: new Date().toISOString()
        });

        // Anti-ViewOnce: forward to owner
        if (isViewOnce && mediaType && fs.existsSync(mediaPath)) {
            try {
                const ownerNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const senderName = sender.split('@')[0];

                const caption = vipBox(`🛡️ 𝙰𝙽𝚃𝙸-𝚅𝙸𝙴𝚆𝙾𝙽𝙲𝙴 ${mediaType.toUpperCase()}`, [
                    `👤 𝙵𝚛𝚘𝚖 : @${senderName}`
                ]);

                const mediaOptions = {
                    caption,
                    mentions: [sender],
                    ...channelInfo
                };

                if (mediaType === 'image') {
                    await sock.sendMessage(ownerNumber, { image: { url: mediaPath }, ...mediaOptions });
                } else if (mediaType === 'video') {
                    await sock.sendMessage(ownerNumber, { video: { url: mediaPath }, ...mediaOptions });
                }
                try { fs.unlinkSync(mediaPath); } catch {}
            } catch (e) {}
        }

    } catch (err) {
        console.error('storeMessage error:', err);
    }
}

// ═══════════════════════════════════════════════════════════
//                    🗑️ HANDLE DELETION
// ═══════════════════════════════════════════════════════════
async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = loadAntideleteConfig(sock);
        if (!config.enabled) return;

        const messageId = revocationMessage.message.protocolMessage.key.id;
        const deletedBy = revocationMessage.participant || revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const ownerNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        if (deletedBy.includes(sock.user.id) || deletedBy === ownerNumber) return;

        const original = messageStore.get(messageId);
        if (!original) return;

        const sender = original.sender;
        const senderName = sender.split('@')[0];
        const groupName = original.group ? (await sock.groupMetadata(original.group)).subject : '';

        const time = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const lines = [
            `🗑️ 𝙳𝚎𝚕𝚎𝚝𝚎𝚍 𝙱𝚢 : @${deletedBy.split('@')[0]}`,
            `👤 𝚂𝚎𝚗𝚍𝚎𝚛 : @${senderName}`,
            `📱 𝙽𝚞𝚖𝚋𝚎𝚛 : ${sender}`,
            `🕐 𝚃𝚒𝚖𝚎 : ${time}`
        ];

        if (groupName) lines.push(`👥 𝙶𝚛𝚘𝚞𝚙 : ${groupName}`);
        if (original.content) lines.push(`💬 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 : ${original.content}`);

        await sock.sendMessage(ownerNumber, {
            text: vipBox('🛡️ 𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴 𝙳𝙴𝚃𝙴𝙲𝚃𝙴𝙳', lines),
            mentions: [deletedBy, sender],
            ...channelInfo
        });

        // Send deleted media
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaCaption = vipBox(`🛡️ 𝙳𝙴𝙻𝙴𝚃𝙴𝙳 ${original.mediaType.toUpperCase()}`, [
                `👤 𝙵𝚛𝚘𝚖 : @${senderName}`
            ]);

            const mediaOptions = {
                caption: mediaCaption,
                mentions: [sender],
                ...channelInfo
            };

            try {
                switch (original.mediaType) {
                    case 'image':
                        await sock.sendMessage(ownerNumber, {
                            image: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'sticker':
                        await sock.sendMessage(ownerNumber, {
                            sticker: { url: original.mediaPath },
                            ...channelInfo
                        });
                        break;
                    case 'video':
                        await sock.sendMessage(ownerNumber, {
                            video: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'audio':
                        await sock.sendMessage(ownerNumber, {
                            audio: { url: original.mediaPath },
                            mimetype: 'audio/mpeg',
                            ptt: false,
                            ...mediaOptions
                        });
                        break;
                }
            } catch (err) {
                await sock.sendMessage(ownerNumber, {
                    text: vipBox('⚠️ 𝙼𝙴𝙳𝙸𝙰 𝙴𝚁𝚁𝙾𝚁', [
                        err.message
                    ]),
                    ...channelInfo
                });
            }

            try {
                fs.unlinkSync(original.mediaPath);
            } catch (err) {
                console.error('Media cleanup error:', err);
            }
        }

        messageStore.delete(messageId);

    } catch (err) {
        console.error('handleMessageRevocation error:', err);
    }
}

module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage
};