const fs = require('fs');
const path = require('path');

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

const warningsFilePath = path.join(__dirname, '../data/warnings.json');

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
//                    📂 STORAGE
// ═══════════════════════════════════════════════════════════
function loadWarnings() {
    try {
        if (!fs.existsSync(warningsFilePath)) {
            fs.mkdirSync(path.dirname(warningsFilePath), { recursive: true });
            fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
        }
        const data = fs.readFileSync(warningsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading warnings:', error);
        return {};
    }
}

// ═══════════════════════════════════════════════════════════
//                    🚀 WARNINGS COMMAND
// ═══════════════════════════════════════════════════════════
async function warningsCommand(sock, chatId, mentionedJidList, message) {
    try {
        await addReaction(sock, message, '⚠️');

        const warnings = loadWarnings();

        // ❌ No mention
        if (!mentionedJidList || mentionedJidList.length === 0) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('⚠️ ᴡᴀʀɴɪɴɢꜱ', [
                    '📌 ᴜꜱᴀɢᴇ :',
                    '• .warnings @user',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴍᴇɴᴛɪᴏɴ ᴀ ᴜꜱᴇʀ ᴛᴏ ᴄʜᴇᴄᴋ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const userToCheck = mentionedJidList[0];
        const warningCount = warnings[userToCheck] || 0;
        const targetName = userToCheck.split('@')[0];

        // 🎨 Status based on warning count
        let statusEmoji = '🟢';
        let statusText = 'ᴄʟᴇᴀɴ';
        let extraLine = '✅ ɴᴏ ᴡᴀʀɴɪɴɢꜱ ʏᴇᴛ';

        if (warningCount >= 3) {
            statusEmoji = '🔴';
            statusText = 'ʜɪɢʜ ʀɪꜱᴋ';
            extraLine = '🚨 ᴋɪᴄᴋ ᴛʜʀᴇꜱʜᴏʟᴅ ʀᴇᴀᴄʜᴇᴅ';
        } else if (warningCount >= 1) {
            statusEmoji = '🟡';
            statusText = 'ᴄᴀᴜᴛɪᴏɴ';
            extraLine = '⚠️ ʙᴇ ᴄᴀʀᴇꜰᴜʟ';
        }

        await addReaction(sock, message, warningCount >= 3 ? '🔴' : warningCount >= 1 ? '🟡' : '🟢');

        await sock.sendMessage(chatId, {
            text: box('⚠️ ᴡᴀʀɴɪɴɢ ꜱᴛᴀᴛᴜꜱ', [
                `👤 ᴜꜱᴇʀ : @${targetName}`,
                `📊 ᴄᴏᴜɴᴛ : ${warningCount} / 3`,
                `${statusEmoji} ꜱᴛᴀᴛᴜꜱ : ${statusText}`,
                '━━━━━━━━━━━━━━━━━━',
                extraLine
            ]),
            mentions: [userToCheck],
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Warnings command error:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [
                '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ᴄʜᴇᴄᴋ ᴡᴀʀɴɪɴɢꜱ',
                '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = warningsCommand;