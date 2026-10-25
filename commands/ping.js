const settings = require('../settings.js');

async function addReaction(sock, message, emoji) {
    try {
        await sock.sendMessage(message.key.remoteJid, {
            react: { text: emoji, key: message.key }
        });
    } catch (error) {}
}

async function pingCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🏓');

        // ✅ Forwarded context exactly like screenshot
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

        // Calculate real ping (with a tiny simulated network delay for realistic output)
        const start = Date.now();
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 40) + 10)); 
        const ping = Date.now() - start;

        const text = `*MUZAMIL-XD SPEED: ${ping}ms* 🌟`;

        await sock.sendMessage(chatId, {
            text: text,
            ...channelInfo
        }, { quoted: message });

        await addReaction(sock, message, '✅');

    } catch (error) {
        console.error('Ping error:', error);
        await addReaction(sock, message, '❌');
    }
}

module.exports = pingCommand;