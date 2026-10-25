const { askLlama } = require('../lib/llama');

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
//                    🚀 MAIN AI COMMAND
// ═══════════════════════════════════════════════════════════
async function aiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;

        if (!text) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: vipBox('🧠 𝙰𝙸 𝙲𝙷𝙰𝚃 𝙰𝚂𝚂𝙸𝚂𝚃𝙰𝙽𝚃', [
                    '📌 𝚄𝚜𝚊𝚐𝚎 :',
                    '• .gpt [question]',
                    '• .gemini [question]',
                    '🔍 𝙴𝚡𝚊𝚖𝚙𝚕𝚎𝚜 :',
                    '• .gpt write a basic html code',
                    '• .gemini What is AI?'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ').trim();

        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: vipBox('❌ 𝙽𝙾 𝚀𝚄𝙴𝚂𝚃𝙸𝙾𝙽', [
                    'Please provide a question after command.',
                    '🔍 𝙴𝚡𝚊𝚖𝚙𝚕𝚎 :',
                    '• .gpt What is JavaScript?'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        try {
            await addReaction(sock, message, '🤖');

            if (command === '.gpt' || command === '.gemini') {
                const answer = await askLlama(query);
                const title = command === '.gpt' ? '𝗚𝗣𝗧' : '𝗚𝗲𝗺𝗶𝗻𝗶';
                const shortQuery = query.length > 40 ? query.substring(0, 40) + '...' : query;

                const styledAnswer =
`╭━━━━━━━━━━━━━━━╮
   🧠 ${title} 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘
╰━━━━━━━━━━━━━━━╯
📌 𝗤𝘂𝗲𝗿𝘆 :
${shortQuery}
━━━━━━━━━━━━━━━━
💬 𝗔𝗻𝘀𝘄𝗲𝗿 :
${answer}
━━━━━━━━━━━━━━━━
👑 𝗕𝘆 : 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫`;

                await sock.sendMessage(chatId, {
                    text: styledAnswer
                }, { quoted: message, ...channelInfo });
                await addReaction(sock, message, '✅');
            } else {
                await addReaction(sock, message, '❌');
                return await sock.sendMessage(chatId, {
                    text: vipBox('❌ 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝙲𝙾𝙼𝙼𝙰𝙽𝙳', [
                        'Available commands:',
                        '• .gpt [question]',
                        '• .gemini [question]'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            }
        } catch (error) {
            console.error('API Error:', error);
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: vipBox('❌ 𝙰𝙿𝙸 𝙴𝚁𝚁𝙾𝚁', [
                    'Failed to get response.',
                    'Please try again later.',
                    `💡 ${error.message || 'Unknown error'}`
                ]),
                ...channelInfo
            }, { quoted: message });
        }
    } catch (error) {
        console.error('AI Command Error:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                'Something went wrong.',
                'Please try again later.',
                `💡 ${error.message || 'Unknown error'}`
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = aiCommand;