const { bots } = require('./antilink');
const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
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
//                    🚀 COMMAND HANDLER
// ═══════════════════════════════════════════════════════════
async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        await addReaction(sock, message, '🔗');

        if (!isSenderAdmin) {
            await addReaction(sock, message, '⛔');
            await sock.sendMessage(chatId, {
                text: vipBox('⛔ 𝙰𝙲𝙲𝙴𝚂𝚂 𝙳𝙴𝙽𝙸𝙴𝙳', [
                    'For Group Admins Only!',
                    "You don't have permission to use this command."
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        // ❌ No argument → menu
        if (!action) {
            await addReaction(sock, message, '📋');
            await sock.sendMessage(chatId, {
                text: vipBox('🔗 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝙼𝙴𝙽𝚄', [
                    '📌 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜 :',
                    '• .antilink on',
                    '• .antilink off',
                    '• .antilink set delete',
                    '• .antilink set kick',
                    '• .antilink set warn',
                    '• .antilink get'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on': {
                await addReaction(sock, message, '✅');
                const existingConfig = await getAntilink(chatId, 'on', sock);
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, {
                        text: vipBox('⚠️ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝚂𝚃𝙰𝚃𝚄𝚂', [
                            '📊 𝚂𝚝𝚊𝚝𝚞𝚜 : Already ON',
                            `⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 : ${existingConfig.action || 'delete'}`,
                            '💡 𝚄𝚜𝚎 : .antilink off to disable'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const result = await setAntilink(chatId, 'on', 'delete', sock);
                if (result) {
                    await sock.sendMessage(chatId, {
                        text: vipBox('✅ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝙴𝙽𝙰𝙱𝙻𝙴𝙳', [
                            '📊 𝚂𝚝𝚊𝚝𝚞𝚜 : ON',
                            '⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 : Delete',
                            '🔗 𝙻𝚒𝚗𝚔𝚜 : Will be deleted'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                            'Failed to turn on Antilink',
                            'Please try again later'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                }
                break;
            }

            case 'off': {
                await addReaction(sock, message, '🔕');
                await removeAntilink(chatId, 'on', sock);
                await sock.sendMessage(chatId, {
                    text: vipBox('🔕 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝙳𝙸𝚂𝙰𝙱𝙻𝙴𝙳', [
                        '📊 𝚂𝚝𝚊𝚝𝚞𝚜 : OFF',
                        '🔗 𝙻𝚒𝚗𝚔𝚜 : Now allowed'
                    ]),
                    ...channelInfo
                }, { quoted: message });
                break;
            }

            case 'set': {
                await addReaction(sock, message, '⚙️');
                if (args.length < 2) {
                    await sock.sendMessage(chatId, {
                        text: vipBox('⚙️ 𝚂𝙴𝚃 𝙰𝙲𝚃𝙸𝙾𝙽', [
                            '📌 𝙲𝚑𝚘𝚘𝚜𝚎 𝚊𝚌𝚝𝚒𝚘𝚗 :',
                            '• .antilink set delete',
                            '• .antilink set kick',
                            '• .antilink set warn'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await addReaction(sock, message, '❌');
                    await sock.sendMessage(chatId, {
                        text: vipBox('❌ 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝙰𝙲𝚃𝙸𝙾𝙽', [
                            'Choose : delete, kick, warn'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntilink(chatId, 'on', setAction, sock);
                if (setResult) {
                    const actionEmoji = setAction === 'delete' ? '🗑️' : setAction === 'kick' ? '👢' : '⚠️';
                    await sock.sendMessage(chatId, {
                        text: vipBox('✅ 𝙰𝙲𝚃𝙸𝙾𝙽 𝚄𝙿𝙳𝙰𝚃𝙴𝙳', [
                            `${actionEmoji} 𝙰𝚌𝚝𝚒𝚘𝚗 : ${setAction.toUpperCase()}`,
                            `⚙️ 𝙰𝚗𝚝𝚒𝚕𝚒𝚗𝚔 𝚠𝚒𝚕𝚕 𝚗𝚘𝚠 : ${setAction}`
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                            'Failed to set action',
                            'Please try again later'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                }
                break;
            }

            case 'get': {
                await addReaction(sock, message, '📊');
                const status = await getAntilink(chatId, 'on', sock);
                const actionConfig = await getAntilink(chatId, 'on', sock);

                const statusEmoji = status?.enabled ? '🟢' : '🔴';
                const actionEmoji = actionConfig?.action === 'delete' ? '🗑️' :
                                   actionConfig?.action === 'kick' ? '👢' : '⚠️';

                await sock.sendMessage(chatId, {
                    text: vipBox('📊 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝙲𝙾𝙽𝙵𝙸𝙶', [
                        `📊 𝚂𝚝𝚊𝚝𝚞𝚜 : ${statusEmoji} ${status?.enabled ? 'ON' : 'OFF'}`,
                        `⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 : ${actionEmoji} ${actionConfig?.action ? actionConfig.action.toUpperCase() : 'Not set'}`
                    ]),
                    ...channelInfo
                }, { quoted: message });
                break;
            }

            default: {
                await addReaction(sock, message, '❓');
                await sock.sendMessage(chatId, {
                    text: vipBox('❓ 𝚄𝙽𝙺𝙽𝙾𝚆𝙽 𝙲𝙾𝙼𝙼𝙰𝙽𝙳', [
                        'Use .antilink for help',
                        'Available : on/off/set/get'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            }
        }
    } catch (error) {
        console.error('Error in antilink command:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                'Something went wrong',
                'Please try again later'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

// ═══════════════════════════════════════════════════════════
//                    🛡️ LINK DETECTION
// ═══════════════════════════════════════════════════════════
async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    const antilinkConfig = await getAntilink(chatId, 'on', sock);
    if (!antilinkConfig?.enabled) return;

    let shouldDelete = false;

    const linkPatterns = {
        whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
        whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
        telegram: /t\.me\/[A-Za-z0-9_]+/i,
        allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i,
    };

    if (linkPatterns.allLinks.test(userMessage)) {
        shouldDelete = true;
    }

    if (shouldDelete) {
        const quotedMessageId = message.key.id;
        const quotedParticipant = message.key.participant || senderId;

        try {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: quotedMessageId, participant: quotedParticipant },
            });
        } catch (error) {
            console.error('Failed to delete message:', error);
        }

        const mentionedJidList = [senderId];
        const config = await getAntilink(chatId, 'on', sock);
        const action = config?.action || 'delete';

        let title = '🛡️ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝚆𝙰𝚁𝙽𝙸𝙽𝙶';
        let lines = [];

        switch (action) {
            case 'delete':
                title = '🗑️ 𝙻𝙸𝙽𝙺 𝙳𝙴𝙻𝙴𝚃𝙴𝙳';
                lines = [
                    `👤 𝚄𝚜𝚎𝚛 : @${senderId.split('@')[0]}`,
                    '⚠️ 𝚁𝚎𝚊𝚜𝚘𝚗 : Links not allowed',
                    '🔹 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 : Deleted'
                ];
                break;
            case 'kick':
                try {
                    await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    title = '👢 𝚄𝚂𝙴𝚁 𝙺𝙸𝙲𝙺𝙴𝙳';
                    lines = [
                        `👤 𝚄𝚜𝚎𝚛 : @${senderId.split('@')[0]}`,
                        '⚠️ 𝚁𝚎𝚊𝚜𝚘𝚗 : Sent a link',
                        '🔹 𝙰𝚌𝚝𝚒𝚘𝚗 : Kicked'
                    ];
                } catch (e) {
                    title = '⚠️ 𝙻𝙸𝙽𝙺 𝙳𝙴𝚃𝙴𝙲𝚃𝙴𝙳';
                    lines = [
                        `👤 𝚄𝚜𝚎𝚛 : @${senderId.split('@')[0]}`,
                        '⚠️ Links not allowed!'
                    ];
                }
                break;
            case 'warn':
                title = '⚠️ 𝚆𝙰𝚁𝙽𝙸𝙽𝙶';
                lines = [
                    `👤 𝚄𝚜𝚎𝚛 : @${senderId.split('@')[0]}`,
                    '⚠️ 𝚁𝚎𝚊𝚜𝚘𝚗 : Links not allowed',
                    '🔹 𝙿𝚕𝚎𝚊𝚜𝚎 𝚍𝚘𝚗\'𝚝 𝚜𝚎𝚗𝚍 𝚕𝚒𝚗𝚔𝚜 𝚊𝚐𝚊𝚒𝚗'
                ];
                break;
            default:
                title = '🗑️ 𝙻𝙸𝙽𝙺 𝙳𝙴𝙻𝙴𝚃𝙴𝙳';
                lines = [
                    `👤 𝚄𝚜𝚎𝚛 : @${senderId.split('@')[0]}`,
                    '⚠️ 𝚁𝚎𝚊𝚜𝚘𝚗 : Links not allowed',
                    '🔹 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 : Deleted'
                ];
        }

        await sock.sendMessage(chatId, {
            text: vipBox(title, lines),
            mentions: mentionedJidList,
            ...channelInfo
        });
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};