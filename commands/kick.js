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
//                    👢 KICK COMMAND
// ═══════════════════════════════════════════════════════════
async function kickCommand(sock, chatId, senderId, mentionedJids, message) {
    try {
        await addReaction(sock, message, '👢');

        // 🔐 Permission check
        const isOwner = message.key.fromMe;
        if (!isOwner) {
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
        }

        // 🎯 Target detection
        let usersToKick = [];
        if (mentionedJids && mentionedJids.length > 0) {
            usersToKick = mentionedJids;
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            usersToKick = [message.message.extendedTextMessage.contextInfo.participant];
        }

        if (usersToKick.length === 0) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('👢 ᴋɪᴄᴋ', [
                    '📌 ᴜꜱᴀɢᴇ :',
                    '• .kick @user',
                    '• Reply to message + .kick',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴋɪᴄᴋ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // 🤖 Bot self-kick protection
        const botId = sock.user?.id || '';
        const botLid = sock.user?.lid || '';
        const botPhoneNumber = botId.includes(':') ? botId.split(':')[0] : (botId.includes('@') ? botId.split('@')[0] : botId);
        const botIdFormatted = botPhoneNumber + '@s.whatsapp.net';
        const botLidNumeric = botLid.includes(':') ? botLid.split(':')[0] : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
        const botLidWithoutSuffix = botLid.includes('@') ? botLid.split('@')[0] : botLid;

        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];

        const isTryingToKickBot = usersToKick.some(userId => {
            const userPhoneNumber = userId.includes(':') ? userId.split(':')[0] : (userId.includes('@') ? userId.split('@')[0] : userId);
            const userLidNumeric = userId.includes('@lid') ? userId.split('@')[0].split(':')[0] : '';

            const directMatch = (
                userId === botId ||
                userId === botLid ||
                userId === botIdFormatted ||
                userPhoneNumber === botPhoneNumber ||
                (userLidNumeric && botLidNumeric && userLidNumeric === botLidNumeric)
            );

            if (directMatch) return true;

            const participantMatch = participants.some(p => {
                const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
                const pId = p.id ? p.id.split('@')[0] : '';
                const pLid = p.lid ? p.lid.split('@')[0] : '';
                const pFullId = p.id || '';
                const pFullLid = p.lid || '';
                const pLidNumeric = pLid.includes(':') ? pLid.split(':')[0] : pLid;

                const isThisParticipantBot = (
                    pFullId === botId ||
                    pFullLid === botLid ||
                    pLidNumeric === botLidNumeric ||
                    pPhoneNumber === botPhoneNumber ||
                    pId === botPhoneNumber ||
                    p.phoneNumber === botIdFormatted ||
                    (botLid && pLid && botLidWithoutSuffix === pLid)
                );

                if (isThisParticipantBot) {
                    return (
                        userId === pFullId ||
                        userId === pFullLid ||
                        userPhoneNumber === pPhoneNumber ||
                        userPhoneNumber === pId ||
                        userId === p.phoneNumber ||
                        (pLid && userLidNumeric && userLidNumeric === pLidNumeric) ||
                        (userLidNumeric && pLidNumeric && userLidNumeric === pLidNumeric)
                    );
                }
                return false;
            });

            return participantMatch;
        });

        if (isTryingToKickBot) {
            await addReaction(sock, message, '🤖');
            await sock.sendMessage(chatId, {
                text: box('🤖 ɴɪᴄᴇ ᴛʀʏ', [
                    "ɪ ᴄᴀɴ'ᴛ ᴋɪᴄᴋ ᴍʏꜱᴇʟꜰ! 🤖"
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // 👢 KICK
        await sock.groupParticipantsUpdate(chatId, usersToKick, "remove");

        const usernames = usersToKick.map(jid => `@${jid.split('@')[0]}`);

        await addReaction(sock, message, '✅');
        await sock.sendMessage(chatId, {
            text: box('👢 ᴜꜱᴇʀ ᴋɪᴄᴋᴇᴅ', [
                `👤 ᴜꜱᴇʀ : ${usernames.join(', ')}`,
                '✅ ꜱᴛᴀᴛᴜꜱ : ʀᴇᴍᴏᴠᴇᴅ ꜰʀᴏᴍ ɢʀᴏᴜᴘ',
                '👑 ʙʏ : 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫'
            ]),
            mentions: usersToKick,
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in kick command:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ꜰᴀɪʟᴇᴅ', [
                '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ᴋɪᴄᴋ ᴜꜱᴇʀ(ꜱ)',
                '💡 ᴄʜᴇᴄᴋ ᴘᴇʀᴍɪꜱꜱɪᴏɴꜱ & ᴛʀʏ ᴀɢᴀɪɴ'
            ]),
            ...channelInfo
        });
    }
}

module.exports = kickCommand;