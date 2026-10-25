const fs = require('fs');
const path = require('path');
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
//                    📂 FILE PATHS
// ═══════════════════════════════════════════════════════════
const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');

function initializeWarningsFile() {
    if (!fs.existsSync(databaseDir)) {
        fs.mkdirSync(databaseDir, { recursive: true });
    }
    if (!fs.existsSync(warningsPath)) {
        fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
    }
}

// ═══════════════════════════════════════════════════════════
//                    🚀 WARN COMMAND
// ═══════════════════════════════════════════════════════════
async function warnCommand(sock, chatId, senderId, mentionedJids, message) {
    try {
        await addReaction(sock, message, '⚠️');
        initializeWarningsFile();

        // ❌ Not a group
        if (!chatId.endsWith('@g.us')) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('❌ ɢʀᴏᴜᴘ ᴏɴʟʏ', [
                    'ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜꜱᴇᴅ ɪɴ ɢʀᴏᴜᴘꜱ!'
                ]),
                ...channelInfo
            });
            return;
        }

        // 🔐 Admin check
        try {
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

            if (!isBotAdmin) {
                await addReaction(sock, message, '⛔');
                await sock.sendMessage(chatId, {
                    text: box('⛔ ʙᴏᴛ ɴᴏᴛ ᴀᴅᴍɪɴ', [
                        'ᴘʟᴇᴀꜱᴇ ᴍᴀᴋᴇ ᴛʜᴇ ʙᴏᴛ ᴀɴ ᴀᴅᴍɪɴ ꜰɪʀꜱᴛ',
                        'ᴛᴏ ᴜꜱᴇ ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ'
                    ]),
                    ...channelInfo
                });
                return;
            }

            if (!isSenderAdmin) {
                await addReaction(sock, message, '⛔');
                await sock.sendMessage(chatId, {
                    text: box('⛔ ᴀᴅᴍɪɴ ᴏɴʟʏ', [
                        'ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴꜱ ᴄᴀɴ ᴜꜱᴇ ᴛʜᴇ ᴡᴀʀɴ ᴄᴏᴍᴍᴀɴᴅ'
                    ]),
                    ...channelInfo
                });
                return;
            }
        } catch (adminError) {
            console.error('Error checking admin status:', adminError);
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('❌ ᴇʀʀᴏʀ', [
                    'ᴘʟᴇᴀꜱᴇ ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ʙᴏᴛ ɪꜱ',
                    'ᴀɴ ᴀᴅᴍɪɴ ᴏꜰ ᴛʜɪꜱ ɢʀᴏᴜᴘ'
                ]),
                ...channelInfo
            });
            return;
        }

        // 🎯 Target detection
        let userToWarn;
        if (mentionedJids && mentionedJids.length > 0) {
            userToWarn = mentionedJids[0];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToWarn = message.message.extendedTextMessage.contextInfo.participant;
        }

        // ❌ No target
        if (!userToWarn) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ᴛᴀʀɢᴇᴛ', [
                    '📌 ᴜꜱᴀɢᴇ :',
                    '• .warn @user',
                    '• Reply to message + .warn',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴡᴀʀɴ'
                ]),
                ...channelInfo
            });
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            let warnings = {};
            try {
                warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
            } catch (error) {
                warnings = {};
            }

            if (!warnings[chatId]) warnings[chatId] = {};
            if (!warnings[chatId][userToWarn]) warnings[chatId][userToWarn] = 0;

            warnings[chatId][userToWarn]++;
            fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));

            const count = warnings[chatId][userToWarn];
            const targetName = userToWarn.split('@')[0];
            const adminName = senderId.split('@')[0];
            const date = new Date().toLocaleString('en-US', {
                timeZone: 'Asia/Kolkata',
                hour12: true, hour: '2-digit', minute: '2-digit',
                day: '2-digit', month: '2-digit', year: 'numeric'
            });

            // ⚠️ Warning alert
            await addReaction(sock, message, count >= 3 ? '🔴' : count >= 2 ? '🟡' : '⚠️');

            const warningEmoji = count >= 3 ? '🔴' : count >= 2 ? '🟡' : '🟠';
            const status = count >= 3 ? 'ʜɪɢʜ ʀɪꜱᴋ' : count >= 2 ? 'ᴄᴀᴜᴛɪᴏɴ' : 'ᴡᴀʀɴɪɴɢ';

            await sock.sendMessage(chatId, {
                text: box('⚠️ ᴡᴀʀɴɪɴɢ ᴀʟᴇʀᴛ', [
                    `👤 ᴜꜱᴇʀ : @${targetName}`,
                    `⚠️ ᴄᴏᴜɴᴛ : ${count} / 3`,
                    `${warningEmoji} ꜱᴛᴀᴛᴜꜱ : ${status}`,
                    `👑 ᴡᴀʀɴᴇᴅ ʙʏ : @${adminName}`,
                    `📅 ᴅᴀᴛᴇ : ${date}`
                ]),
                mentions: [userToWarn, senderId],
                ...channelInfo
            });

            // 👢 Auto-kick at 3 warnings
            if (count >= 3) {
                await new Promise(resolve => setTimeout(resolve, 1000));

                await sock.groupParticipantsUpdate(chatId, [userToWarn], "remove");
                delete warnings[chatId][userToWarn];
                fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));

                await addReaction(sock, message, '👢');

                await sock.sendMessage(chatId, {
                    text: box('👢 ᴀᴜᴛᴏ-ᴋɪᴄᴋ', [
                        `👤 ᴜꜱᴇʀ : @${targetName}`,
                        '⚠️ ʀᴇᴀꜱᴏɴ : 3 ᴡᴀʀɴɪɴɢꜱ ʀᴇᴀᴄʜᴇᴅ',
                        '👢 ꜱᴛᴀᴛᴜꜱ : ʀᴇᴍᴏᴠᴇᴅ ꜰʀᴏᴍ ɢʀᴏᴜᴘ'
                    ]),
                    mentions: [userToWarn],
                    ...channelInfo
                });
            }
        } catch (error) {
            console.error('Error in warn command:', error);
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('❌ ꜰᴀɪʟᴇᴅ', [
                    'ꜰᴀɪʟᴇᴅ ᴛᴏ ᴡᴀʀɴ ᴜꜱᴇʀ'
                ]),
                ...channelInfo
            });
        }
    } catch (error) {
        console.error('Error in warn command:', error);
        await addReaction(sock, message, '❌');

        let errorText = 'ꜰᴀɪʟᴇᴅ ᴛᴏ ᴡᴀʀɴ ᴜꜱᴇʀ';
        if (error.data === 429) {
            errorText = 'ʀᴀᴛᴇ ʟɪᴍɪᴛ ʀᴇᴀᴄʜᴇᴅ. ᴛʀʏ ᴀɢᴀɪɴ ɪɴ ᴀ ꜰᴇᴡ ꜱᴇᴄᴏɴᴅꜱ';
        } else {
            errorText = 'ᴍᴀᴋᴇ ꜱᴜʀᴇ ʙᴏᴛ ɪꜱ ᴀᴅᴍɪɴ ᴡɪᴛʜ ᴘᴇʀᴍɪꜱꜱɪᴏɴꜱ';
        }

        try {
            await sock.sendMessage(chatId, {
                text: box('❌ ᴇʀʀᴏʀ', [`🔴 ${errorText}`]),
                ...channelInfo
            });
        } catch (sendError) {
            console.error('Error sending error message:', sendError);
        }
    }
}

module.exports = warnCommand;