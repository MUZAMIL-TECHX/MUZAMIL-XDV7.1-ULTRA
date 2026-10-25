const { setAntitag, getAntitag, removeAntitag } = require('../lib/index');
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
async function handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        await addReaction(sock, message, '🏷️');

        if (!isSenderAdmin) {
            await addReaction(sock, message, '⛔');
            await sock.sendMessage(chatId, {
                text: vipBox('⛔ 𝙰𝙲𝙲𝙴𝚂𝚂 𝙳𝙴𝙽𝙸𝙴𝙳', [
                    'For Group Admins Only!'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        // ❌ No argument → menu
        if (!action) {
            await addReaction(sock, message, '📋');
            await sock.sendMessage(chatId, {
                text: vipBox('🏷️ 𝙰𝙽𝚃𝙸𝚃𝙰𝙶 𝙼𝙴𝙽𝚄', [
                    '📌 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜 :',
                    `• ${prefix}antitag on`,
                    `• ${prefix}antitag off`,
                    `• ${prefix}antitag set delete`,
                    `• ${prefix}antitag set kick`,
                    `• ${prefix}antitag get`
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on': {
                const existingConfig = await getAntitag(chatId, 'on', sock);
                if (existingConfig?.enabled) {
                    await addReaction(sock, message, '⚠️');
                    await sock.sendMessage(chatId, {
                        text: vipBox('⚠️ 𝙰𝙽𝚃𝙸𝚃𝙰𝙶 𝚂𝚃𝙰𝚃𝚄𝚂', [
                            '📊 𝚂𝚝𝚊𝚝𝚞𝚜 : Already ON',
                            `⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 : ${existingConfig.action || 'delete'}`,
                            `💡 𝚄𝚜𝚎 : ${prefix}antitag off to disable`
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const result = await setAntitag(chatId, 'on', 'delete', sock);
                if (result) {
                    await addReaction(sock, message, '✅');
                    await sock.sendMessage(chatId, {
                        text: vipBox('✅ 𝙰𝙽𝚃𝙸𝚃𝙰𝙶 𝙴𝙽𝙰𝙱𝙻𝙴𝙳', [
                            '📊 𝚂𝚝𝚊𝚝𝚞𝚜 : ON',
                            '⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 : Delete',
                            '🏷️ 𝚃𝚊𝚐𝚊𝚕𝚕 : Will be blocked'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                } else {
                    await addReaction(sock, message, '❌');
                    await sock.sendMessage(chatId, {
                        text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                            'Failed to turn on Antitag',
                            'Please try again later'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                }
                break;
            }

            case 'off': {
                await addReaction(sock, message, '🔕');
                await removeAntitag(chatId, 'on', sock);
                await sock.sendMessage(chatId, {
                    text: vipBox('🔕 𝙰𝙽𝚃𝙸𝚃𝙰𝙶 𝙳𝙸𝚂𝙰𝙱𝙻𝙴𝙳', [
                        '📊 𝚂𝚝𝚊𝚝𝚞𝚜 : OFF',
                        '🏷️ 𝚃𝚊𝚐𝚊𝚕𝚕 : Now allowed'
                    ]),
                    ...channelInfo
                }, { quoted: message });
                break;
            }

            case 'set': {
                if (args.length < 2) {
                    await addReaction(sock, message, '⚙️');
                    await sock.sendMessage(chatId, {
                        text: vipBox('⚙️ 𝚂𝙴𝚃 𝙰𝙲𝚃𝙸𝙾𝙽', [
                            '📌 𝙲𝚑𝚘𝚘𝚜𝚎 𝚊𝚌𝚝𝚒𝚘𝚗 :',
                            `• ${prefix}antitag set delete`,
                            `• ${prefix}antitag set kick`
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick'].includes(setAction)) {
                    await addReaction(sock, message, '❌');
                    await sock.sendMessage(chatId, {
                        text: vipBox('❌ 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝙰𝙲𝚃𝙸𝙾𝙽', [
                            'Choose : delete or kick'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntitag(chatId, 'on', setAction, sock);
                if (setResult) {
                    const emoji = setAction === 'delete' ? '🗑️' : '👢';
                    await addReaction(sock, message, '✅');
                    await sock.sendMessage(chatId, {
                        text: vipBox('✅ 𝙰𝙲𝚃𝙸𝙾𝙽 𝚄𝙿𝙳𝙰𝚃𝙴𝙳', [
                            `${emoji} 𝙰𝚌𝚝𝚒𝚘𝚗 : ${setAction.toUpperCase()}`,
                            `⚙️ 𝙰𝚗𝚝𝚒𝚝𝚊𝚐 𝚠𝚒𝚕𝚕 𝚗𝚘𝚠 : ${setAction}`
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                } else {
                    await addReaction(sock, message, '❌');
                    await sock.sendMessage(chatId, {
                        text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                            'Failed to set Antitag action'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                }
                break;
            }

            case 'get': {
                await addReaction(sock, message, '📊');
                const status = await getAntitag(chatId, 'on', sock);
                const actionConfig = await getAntitag(chatId, 'on', sock);

                const statusEmoji = status?.enabled ? '🟢' : '🔴';
                const actionEmoji = actionConfig?.action === 'delete' ? '🗑️' : '👢';

                await sock.sendMessage(chatId, {
                    text: vipBox('📊 𝙰𝙽𝚃𝙸𝚃𝙰𝙶 𝙲𝙾𝙽𝙵𝙸𝙶', [
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
                        `Use ${prefix}antitag for usage`,
                        'Available : on/off/set/get'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            }
        }
    } catch (error) {
        console.error('Error in antitag command:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                'Error processing antitag command'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

// ═══════════════════════════════════════════════════════════
//                    🏷️ TAG DETECTION
// ═══════════════════════════════════════════════════════════
async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const antitagSetting = await getAntitag(chatId, 'on', sock);
        if (!antitagSetting || !antitagSetting.enabled) return;

        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        const messageText = (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            ''
        );

        const textMentions = messageText.match(/@[\d+\s\-()~.]+/g) || [];
        const numericMentions = messageText.match(/@\d{10,}/g) || [];
        const allMentions = [...new Set([...mentionedJids, ...textMentions, ...numericMentions])];

        const uniqueNumericMentions = new Set();
        numericMentions.forEach(mention => {
            const numMatch = mention.match(/@(\d+)/);
            if (numMatch) uniqueNumericMentions.add(numMatch[1]);
        });

        const mentionedJidCount = mentionedJids.length;
        const numericMentionCount = uniqueNumericMentions.size;
        const totalMentions = Math.max(mentionedJidCount, numericMentionCount);

        if (totalMentions >= 3) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];

            const mentionThreshold = Math.ceil(participants.length * 0.5);

            const hasManyNumericMentions = numericMentionCount >= 10 ||
                                          (numericMentionCount >= 5 && numericMentionCount >= mentionThreshold);

            if (totalMentions >= mentionThreshold || hasManyNumericMentions) {

                const action = antitagSetting.action || 'delete';
                const name = `@${senderId.split('@')[0]}`;

                if (action === 'delete') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });

                    await sock.sendMessage(chatId, {
                        text: vipBox('🗑️ 𝚃𝙰𝙶𝙰𝙻𝙻 𝙳𝙴𝙻𝙴𝚃𝙴𝙳', [
                            `👤 𝚄𝚜𝚎𝚛 : ${name}`,
                            '🔹 𝚁𝚎𝚊𝚜𝚘𝚗 : Mass tagging detected'
                        ]),
                        mentions: [senderId],
                        ...channelInfo
                    }, { quoted: message });

                } else if (action === 'kick') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });

                    await sock.groupParticipantsUpdate(chatId, [senderId], "remove");

                    await sock.sendMessage(chatId, {
                        text: vipBox('👢 𝚄𝚂𝙴𝚁 𝙺𝙸𝙲𝙺𝙴𝙳', [
                            `👤 𝚄𝚜𝚎𝚛 : ${name}`,
                            '🔹 𝚁𝚎𝚊𝚜𝚘𝚗 : Mass tagging detected'
                        ]),
                        mentions: [senderId],
                        ...channelInfo
                    }, { quoted: message });
                }
            }
        }
    } catch (error) {
        console.error('Error in tag detection:', error);
    }
}

module.exports = {
    handleAntitagCommand,
    handleTagDetection
};