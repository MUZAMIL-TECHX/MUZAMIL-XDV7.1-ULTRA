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
//                    💎 VIP DESIGN FRAME (CLEAN FONT)
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
//                    📂 STATE HELPERS
// ═══════════════════════════════════════════════════════════
function readState(sock) {
    return readSessionJson(sock, 'anticall.json', { enabled: false });
}

function writeState(sock, enabled) {
    writeSessionJson(sock, 'anticall.json', { enabled: !!enabled });
}

// ═══════════════════════════════════════════════════════════
//                    🚀 MAIN COMMAND
// ═══════════════════════════════════════════════════════════
async function anticallCommand(sock, chatId, message, args) {
    try {
        const state = readState(sock);
        const sub = (args || '').trim().toLowerCase();

        // ❌ No/Invalid subcommand
        if (!sub || (sub !== 'on' && sub !== 'off' && sub !== 'status')) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: vipBox('📞 𝙰𝙽𝚃𝙸𝙲𝙰𝙻𝙻 𝙼𝙴𝙽𝚄', [
                    '📌 𝚄𝚜𝚊𝚐𝚎 :',
                    '• .anticall on — Enable auto-block',
                    '• .anticall off — Disable anticall',
                    '• .anticall status — Show current state'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // 📊 Status
        if (sub === 'status') {
            const emoji = state.enabled ? '🟢' : '🔴';
            await addReaction(sock, message, '📊');
            await sock.sendMessage(chatId, {
                text: vipBox('📞 𝙰𝙽𝚃𝙸𝙲𝙰𝙻𝙻 𝚂𝚃𝙰𝚃𝚄𝚂', [
                    `${emoji} 𝙲𝚞𝚛𝚛𝚎𝚗𝚝 : ${state.enabled ? 'ON' : 'OFF'}`
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // ✅ Toggle ON/OFF
        const enable = sub === 'on';
        writeState(sock, enable);
        await addReaction(sock, message, enable ? '✅' : '🔕');
        await sock.sendMessage(chatId, {
            text: vipBox('📞 𝙰𝙽𝚃𝙸𝙲𝙰𝙻𝙻 𝚄𝙿𝙳𝙰𝚃𝙴𝙳', [
                `${enable ? '🟢' : '🔴'} 𝙽𝚎𝚠 𝚂𝚝𝚊𝚝𝚎 : ${enable ? 'ENABLED' : 'DISABLED'}`
            ]),
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Anticall error:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                error.message || 'Unknown error'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = { anticallCommand, readState };