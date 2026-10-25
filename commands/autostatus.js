const isOwnerOrSudo = require('../lib/isOwner');
const { readSessionJson, writeSessionJson } = require('../lib/session_data');

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
const defaultConfig = { enabled: false, reactOn: false };

// ═══════════════════════════════════════════════════════════
//                    🚀 COMMAND HANDLER
// ═══════════════════════════════════════════════════════════
async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        await addReaction(sock, msg, '🔄');

        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!msg.key.fromMe && !isOwner) {
            await addReaction(sock, msg, '⛔');
            await sock.sendMessage(chatId, {
                text: vipBox('⛔ 𝙰𝙲𝙲𝙴𝚂𝚂 𝙳𝙴𝙽𝙸𝙴𝙳', [
                    'Only the bot owner can use this command!'
                ]),
                ...channelInfo
            }, { quoted: msg });
            return;
        }

        let config = readSessionJson(sock, 'autoStatus.json', defaultConfig);

        // 📋 No argument → show menu
        if (!args || args.length === 0) {
            const statusEmoji = config.enabled ? '🟢' : '🔴';
            const reactEmoji = config.reactOn ? '🟢' : '🔴';
            await addReaction(sock, msg, '📋');
            await sock.sendMessage(chatId, {
                text: vipBox('🔄 𝙰𝚄𝚃𝙾 𝚂𝚃𝙰𝚃𝚄𝚂 𝙼𝙴𝙽𝚄', [
                    `📱 𝙰𝚞𝚝𝚘 𝚅𝚒𝚎𝚠 : ${statusEmoji} ${config.enabled ? 'ON' : 'OFF'}`,
                    `💫 𝚁𝚎𝚊𝚌𝚝𝚒𝚘𝚗𝚜 : ${reactEmoji} ${config.reactOn ? 'ON' : 'OFF'}`,
                    '━━━━━━━━━━━━━━━━',
                    '📌 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜 :',
                    '• .autostatus on',
                    '• .autostatus off',
                    '• .autostatus react on',
                    '• .autostatus react off'
                ]),
                ...channelInfo
            }, { quoted: msg });
            return;
        }

        const command = args[0].toLowerCase();

        // ✅ ON
        if (command === 'on') {
            config.enabled = true;
            writeSessionJson(sock, 'autoStatus.json', config);
            await addReaction(sock, msg, '✅');
            await sock.sendMessage(chatId, {
                text: vipBox('✅ 𝙰𝚄𝚃𝙾 𝚅𝙸𝙴𝚆 𝙾𝙽', [
                    '📱 𝙱𝚘𝚝 𝚠𝚒𝚕𝚕 𝚗𝚘𝚠 𝚟𝚒𝚎𝚠',
                    '𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝 𝚜𝚝𝚊𝚝𝚞𝚜𝚎𝚜 𝚊𝚞𝚝𝚘𝚖𝚊𝚝𝚒𝚌𝚊𝚕𝚕𝚢'
                ]),
                ...channelInfo
            }, { quoted: msg });
            return;
        }

        // 🔕 OFF
        if (command === 'off') {
            config.enabled = false;
            writeSessionJson(sock, 'autoStatus.json', config);
            await addReaction(sock, msg, '🔕');
            await sock.sendMessage(chatId, {
                text: vipBox('🔕 𝙰𝚄𝚃𝙾 𝚅𝙸𝙴𝚆 𝙾𝙵𝙵', [
                    '📱 𝙱𝚘𝚝 𝚠𝚒𝚕𝚕 𝚗𝚘 𝚕𝚘𝚗𝚐𝚎𝚛',
                    '𝚟𝚒𝚎𝚠 𝚜𝚝𝚊𝚝𝚞𝚜𝚎𝚜 𝚊𝚞𝚝𝚘𝚖𝚊𝚝𝚒𝚌𝚊𝚕𝚕𝚢'
                ]),
                ...channelInfo
            }, { quoted: msg });
            return;
        }

        // 💫 REACT
        if (command === 'react') {
            if (!args[1]) {
                await addReaction(sock, msg, '❌');
                await sock.sendMessage(chatId, {
                    text: vipBox('❌ 𝙼𝙸𝚂𝚂𝙸𝙽𝙶 𝙰𝚁𝙶𝚄𝙼𝙴𝙽𝚃', [
                        '📌 𝚄𝚜𝚎 :',
                        '• .autostatus react on',
                        '• .autostatus react off'
                    ]),
                    ...channelInfo
                }, { quoted: msg });
                return;
            }

            const reactCommand = args[1].toLowerCase();

            if (reactCommand === 'on') {
                config.reactOn = true;
                writeSessionJson(sock, 'autoStatus.json', config);
                await addReaction(sock, msg, '💫');
                await sock.sendMessage(chatId, {
                    text: vipBox('💫 𝚁𝙴𝙰𝙲𝚃𝙸𝙾𝙽𝚂 𝙾𝙽', [
                        '📱 𝙱𝚘𝚝 𝚠𝚒𝚕𝚕 𝚗𝚘𝚠 𝚛𝚎𝚊𝚌𝚝',
                        '𝚝𝚘 𝚜𝚝𝚊𝚝𝚞𝚜 𝚞𝚙𝚍𝚊𝚝𝚎𝚜'
                    ]),
                    ...channelInfo
                }, { quoted: msg });
            } else if (reactCommand === 'off') {
                config.reactOn = false;
                writeSessionJson(sock, 'autoStatus.json', config);
                await addReaction(sock, msg, '🔕');
                await sock.sendMessage(chatId, {
                    text: vipBox('🔕 𝚁𝙴𝙰𝙲𝚃𝙸𝙾𝙽𝚂 𝙾𝙵𝙵', [
                        '📱 𝙱𝚘𝚝 𝚠𝚒𝚕𝚕 𝚗𝚘 𝚕𝚘𝚗𝚐𝚎𝚛',
                        '𝚛𝚎𝚊𝚌𝚝 𝚝𝚘 𝚜𝚝𝚊𝚝𝚞𝚜 𝚞𝚙𝚍𝚊𝚝𝚎𝚜'
                    ]),
                    ...channelInfo
                }, { quoted: msg });
            } else {
                await addReaction(sock, msg, '❌');
                await sock.sendMessage(chatId, {
                    text: vipBox('❌ 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝙾𝙿𝚃𝙸𝙾𝙽', [
                        '📌 𝚄𝚜𝚎 :',
                        '• .autostatus react on',
                        '• .autostatus react off'
                    ]),
                    ...channelInfo
                }, { quoted: msg });
            }
            return;
        }

        // ❓ Unknown
        await addReaction(sock, msg, '❓');
        await sock.sendMessage(chatId, {
            text: vipBox('❓ 𝚄𝙽𝙺𝙽𝙾𝚆𝙽 𝙲𝙾𝙼𝙼𝙰𝙽𝙳', [
                '📌 𝙰𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 :',
                '• .autostatus on/off',
                '• .autostatus react on/off'
            ]),
            ...channelInfo
        }, { quoted: msg });

    } catch (error) {
        console.error('Error in autostatus command:', error);
        await addReaction(sock, msg, '❌');
        await sock.sendMessage(chatId, {
            text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                error.message || 'Something went wrong'
            ]),
            ...channelInfo
        }, { quoted: msg });
    }
}

// ═══════════════════════════════════════════════════════════
//                    ⚙️ CONFIG CHECKS
// ═══════════════════════════════════════════════════════════
function isAutoStatusEnabled(sock) {
    try {
        const config = readSessionJson(sock, 'autoStatus.json', defaultConfig);
        return config.enabled;
    } catch (error) {
        console.error('Error checking auto status config:', error);
        return false;
    }
}

function isStatusReactionEnabled(sock) {
    try {
        const config = readSessionJson(sock, 'autoStatus.json', defaultConfig);
        return config.reactOn;
    } catch (error) {
        console.error('Error checking status reaction config:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════
//                    💫 STATUS REACTION
// ═══════════════════════════════════════════════════════════
async function reactToStatus(sock, statusKey) {
    try {
        if (!isStatusReactionEnabled(sock)) return;

        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
    } catch (error) {
        console.error('❌ Error reacting to status:', error.message);
    }
}

// ═══════════════════════════════════════════════════════════
//                    👁️ STATUS HANDLER
// ═══════════════════════════════════════════════════════════
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled(sock)) return;

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await sock.readMessages([msg.key]);
                    await reactToStatus(sock, msg.key);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ Rate limit hit, waiting...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await sock.readMessages([msg.key]);
                    } else {
                        throw err;
                    }
                }
                return;
            }
        }

        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.key]);
                await reactToStatus(sock, status.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, waiting...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.reaction.key]);
                await reactToStatus(sock, status.reaction.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, waiting...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.reaction.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate
};