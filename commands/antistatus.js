const { readSessionJson, writeSessionJson } = require('../lib/session_data');
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
const DEFAULT_CONFIG = {
    enabled: false,
    action: 'delete'
};

const VALID_ACTIONS = new Set(['warn', 'kick', 'delete']);

function getConfig(sock) {
    return {
        ...DEFAULT_CONFIG,
        ...readSessionJson(sock, 'antistatus.json', {})
    };
}

function setConfig(sock, patch) {
    const config = {
        ...getConfig(sock),
        ...patch
    };
    writeSessionJson(sock, 'antistatus.json', config);
    return config;
}

function getWarnings(sock) {
    return readSessionJson(sock, 'antistatusWarnings.json', {});
}

function incrementWarning(sock, chatId, senderId) {
    const warnings = getWarnings(sock);
    if (!warnings[chatId]) warnings[chatId] = {};
    warnings[chatId][senderId] = (Number(warnings[chatId][senderId]) || 0) + 1;
    writeSessionJson(sock, 'antistatusWarnings.json', warnings);
    return warnings[chatId][senderId];
}

function clearWarnings(sock, chatId, senderId) {
    const warnings = getWarnings(sock);
    if (warnings[chatId]?.[senderId]) {
        delete warnings[chatId][senderId];
        writeSessionJson(sock, 'antistatusWarnings.json', warnings);
    }
}

// ═══════════════════════════════════════════════════════════
//                    🔍 STATUS DETECTION
// ═══════════════════════════════════════════════════════════
function messageContainsStatusMention(message) {
    const root = message?.message;
    if (!root || typeof root !== 'object') return false;

    const statusKeys = new Set([
        'statusmentionmessage',
        'groupstatusmentionmessage',
        'statusmention'
    ]);

    function scan(node, depth = 0) {
        if (!node || typeof node !== 'object' || depth > 8) return false;
        for (const [key, value] of Object.entries(node)) {
            const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
            if (statusKeys.has(normalized)) return true;
            if (value && typeof value === 'object' && scan(value, depth + 1)) return true;
        }
        return false;
    }

    return scan(root);
}

function deleteGroupMessage(sock, chatId, message, senderId) {
    return sock.sendMessage(chatId, {
        delete: {
            remoteJid: chatId,
            fromMe: false,
            id: message.key.id,
            participant: senderId
        }
    });
}

function displayName(jid) {
    return `@${String(jid || '').split('@')[0].split(':')[0] || 'user'}`;
}

// ═══════════════════════════════════════════════════════════
//                    🚀 COMMAND HANDLER
// ═══════════════════════════════════════════════════════════
async function handleAntiStatusCommand(sock, chatId, rawText, senderId, message) {
    try {
        await addReaction(sock, message, '🛡️');

        if (!chatId?.endsWith('@g.us')) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: vipBox('⚠️ 𝙶𝚁𝙾𝚄𝙿 𝙾𝙽𝙻𝚈', [
                    'This command is for groups only.'
                ]),
                ...channelInfo
            }, { quoted: message });
            return true;
        }

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await addReaction(sock, message, '⛔');
            await sock.sendMessage(chatId, {
                text: vipBox('⚠️ 𝙰𝙳𝙼𝙸𝙽 𝚁𝙴𝚀𝚄𝙸𝚁𝙴𝙳', [
                    'Please make me a group admin first.'
                ]),
                ...channelInfo
            }, { quoted: message });
            return true;
        }

        if (!isSenderAdmin && !message.key.fromMe) {
            await addReaction(sock, message, '⛔');
            await sock.sendMessage(chatId, {
                text: vipBox('⛔ 𝙰𝙲𝙲𝙴𝚂𝚂 𝙳𝙴𝙽𝙸𝙴𝙳', [
                    'Only group admins can change Anti-Status settings.'
                ]),
                ...channelInfo
            }, { quoted: message });
            return true;
        }

        const match = String(rawText || '').match(/^\.antistatus(?:set)?\b\s*(.*)$/i);
        const command = String(rawText || '').toLowerCase().startsWith('.antistatusset')
            ? 'set'
            : 'toggle';
        const argument = (match?.[1] || '').trim().toLowerCase();
        const config = getConfig(sock);

        // ⚙️ SET ACTION
        if (command === 'set') {
            if (!VALID_ACTIONS.has(argument)) {
                await addReaction(sock, message, '❌');
                await sock.sendMessage(chatId, {
                    text: vipBox('⚙️ 𝙰𝙽𝚃𝙸-𝚂𝚃𝙰𝚃𝚄𝚂 𝚂𝙴𝚃', [
                        '📌 𝙲𝚑𝚘𝚘𝚜𝚎 𝚊𝚌𝚝𝚒𝚘𝚗 :',
                        '• .antistatusset warn',
                        '• .antistatusset kick',
                        '• .antistatusset delete'
                    ]),
                    ...channelInfo
                }, { quoted: message });
                return true;
            }
            setConfig(sock, { action: argument });
            await addReaction(sock, message, '✅');
            await sock.sendMessage(chatId, {
                text: vipBox('✅ 𝚂𝙴𝚃𝚃𝙸𝙽𝙶 𝚄𝙿𝙳𝙰𝚃𝙴𝙳', [
                    `⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 : ${argument.toUpperCase()}`,
                    `📊 𝚂𝚝𝚊𝚝𝚞𝚜 : ${config.enabled ? '🟢 ON' : '🔴 OFF'}`
                ]),
                ...channelInfo
            }, { quoted: message });
            return true;
        }

        // ✅ ON / OFF
        if (argument === 'on' || argument === 'off') {
            const next = argument === 'on';
            setConfig(sock, { enabled: next });

            await addReaction(sock, message, next ? '✅' : '🔕');

            if (next) {
                await sock.sendMessage(chatId, {
                    text: vipBox('✅ 𝙰𝙽𝚃𝙸-𝚂𝚃𝙰𝚃𝚄𝚂 𝙾𝙽', [
                        `⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 : ${config.action.toUpperCase()}`,
                        '🛡️ 𝚂𝚝𝚊𝚝𝚞𝚜 𝚖𝚎𝚗𝚝𝚒𝚘𝚗𝚜 𝚠𝚒𝚕𝚕 𝚋𝚎 𝚑𝚊𝚗𝚍𝚕𝚎𝚍'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: vipBox('🔕 𝙰𝙽𝚃𝙸-𝚂𝚃𝙰𝚃𝚄𝚂 𝙾𝙵𝙵', [
                        'No action will be taken.'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            }
            return true;
        }

        // 📋 MENU (no arg)
        await addReaction(sock, message, '📋');
        await sock.sendMessage(chatId, {
            text: vipBox('⚙️ 𝙰𝙽𝚃𝙸-𝚂𝚃𝙰𝚃𝚄𝚂 𝙼𝙴𝙽𝚄', [
                `📊 𝚂𝚝𝚊𝚝𝚞𝚜 : ${config.enabled ? '🟢 ON' : '🔴 OFF'}`,
                `⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 : ${config.action.toUpperCase()}`,
                '━━━━━━━━━━━━━━━━',
                '📌 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜 :',
                '• .antistatus on/off',
                '• .antistatusset warn/kick/delete'
            ]),
            ...channelInfo
        }, { quoted: message });
        return true;

    } catch (error) {
        console.error('Anti-status error:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                'Something went wrong.',
                'Please try again later.'
            ]),
            ...channelInfo
        }, { quoted: message });
        return true;
    }
}

// ═══════════════════════════════════════════════════════════
//                    🛡️ STATUS MENTION HANDLER
// ═══════════════════════════════════════════════════════════
async function handleAntiStatus(sock, chatId, message, senderId) {
    try {
        const config = getConfig(sock);
        if (!config.enabled || !chatId?.endsWith('@g.us') || message.key?.fromMe) return false;
        if (!messageContainsStatusMention(message)) return false;

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (isSenderAdmin) return false;

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: vipBox('⚠️ 𝙱𝙾𝚃 𝙽𝙾𝚃 𝙰𝙳𝙼𝙸𝙽', [
                    'Anti-Status needs bot to be group admin.'
                ]),
                ...channelInfo
            });
            return true;
        }

        await deleteGroupMessage(sock, chatId, message, senderId);
        const name = displayName(senderId);

        // 🗑️ DELETE MODE
        if (config.action === 'delete') {
            await sock.sendMessage(chatId, {
                text: vipBox('🗑️ 𝚂𝚃𝙰𝚃𝚄𝚂 𝙳𝙴𝙻𝙴𝚃𝙴𝙳', [
                    `👤 𝚄𝚜𝚎𝚛 : ${name}`,
                    '🔹 𝚁𝚎𝚊𝚜𝚘𝚗 : Status mention'
                ]),
                mentions: [senderId],
                ...channelInfo
            });
            return true;
        }

        // 👢 KICK MODE
        if (config.action === 'kick') {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            await sock.sendMessage(chatId, {
                text: vipBox('👢 𝚄𝚂𝙴𝚁 𝙺𝙸𝙲𝙺𝙴𝙳', [
                    `👤 𝚄𝚜𝚎𝚛 : ${name}`,
                    '🔹 𝚁𝚎𝚊𝚜𝚘𝚗 : Status mention'
                ]),
                mentions: [senderId],
                ...channelInfo
            });
            return true;
        }

        // ⚠️ WARN MODE (3 strikes)
        const warningCount = incrementWarning(sock, chatId, senderId);

        if (warningCount >= 3) {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            clearWarnings(sock, chatId, senderId);
            await sock.sendMessage(chatId, {
                text: vipBox('🚫 𝙵𝙸𝙽𝙰𝙻 𝚆𝙰𝚁𝙽𝙸𝙽𝙶', [
                    `👤 𝚄𝚜𝚎𝚛 : ${name}`,
                    '⚠️ 𝟹 𝚠𝚊𝚛𝚗𝚒𝚗𝚐𝚜 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚎',
                    '👢 𝙰𝚌𝚝𝚒𝚘𝚗 : Kicked'
                ]),
                mentions: [senderId],
                ...channelInfo
            });
        } else {
            await sock.sendMessage(chatId, {
                text: vipBox('⚠️ 𝚆𝙰𝚁𝙽𝙸𝙽𝙶', [
                    `👤 𝚄𝚜𝚎𝚛 : ${name}`,
                    '🔹 𝚁𝚎𝚊𝚜𝚘𝚗 : Status mention',
                    `📊 𝚆𝚊𝚛𝚗𝚒𝚗𝚐 : ${warningCount}/3`,
                    '💡 𝟹𝚛𝚍 𝚠𝚊𝚛𝚗𝚒𝚗𝚐 → 𝚔𝚒𝚌𝚔'
                ]),
                mentions: [senderId],
                ...channelInfo
            });
        }
        return true;

    } catch (error) {
        console.error('Anti-status error:', error);
        return false;
    }
}

module.exports = {
    handleAntiStatusCommand,
    handleAntiStatus,
    messageContainsStatusMention
};