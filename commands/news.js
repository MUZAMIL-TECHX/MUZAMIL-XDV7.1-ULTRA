const axios = require('axios');

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
//                    📰 CATEGORY EMOJI
// ═══════════════════════════════════════════════════════════
function getNewsEmoji(title) {
    const lower = title.toLowerCase();
    if (lower.includes('covid') || lower.includes('virus') || lower.includes('health')) return '🏥';
    if (lower.includes('tech') || lower.includes('apple') || lower.includes('google') || lower.includes('ai')) return '💻';
    if (lower.includes('sport') || lower.includes('football') || lower.includes('cricket') || lower.includes('game')) return '⚽';
    if (lower.includes('politic') || lower.includes('govt') || lower.includes('election') || lower.includes('president')) return '🏛️';
    if (lower.includes('weather') || lower.includes('storm') || lower.includes('flood') || lower.includes('earthquake')) return '🌤️';
    if (lower.includes('business') || lower.includes('stock') || lower.includes('market') || lower.includes('economy')) return '💹';
    if (lower.includes('entertain') || lower.includes('movie') || lower.includes('film') || lower.includes('celebrity')) return '🎬';
    if (lower.includes('crime') || lower.includes('police') || lower.includes('court') || lower.includes('murder')) return '🚨';
    if (lower.includes('world') || lower.includes('international') || lower.includes('global')) return '🌍';
    return '📌';
}

// ═══════════════════════════════════════════════════════════
//                    📰 NEWS COMMAND
// ═══════════════════════════════════════════════════════════
async function newsCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '📰');

        // ⏳ Loading message
        const loadingMsg = await sock.sendMessage(chatId, {
            text: box('📰 ꜰᴇᴛᴄʜɪɴɢ ɴᴇᴡꜱ', [
                '⏳ ɢᴇᴛᴛɪɴɢ ᴛᴏᴘ ʜᴇᴀᴅʟɪɴᴇꜱ...',
                '💡 ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ'
            ]),
            ...channelInfo
        }, { quoted: message });

        const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c';
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // ❌ No articles
        if (!response.data || !response.data.articles || response.data.articles.length === 0) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ɴᴇᴡꜱ ꜰᴏᴜɴᴅ', [
                    '🔴 ᴄᴏᴜʟᴅ ɴᴏᴛ ꜰᴇᴛᴄʜ ɴᴇᴡꜱ ʀɪɢʜᴛ ɴᴏᴡ',
                    '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const articles = response.data.articles.slice(0, 5);
        const totalResults = response.data.totalResults || articles.length;

        // ═══════════════════════════════════════
        // 📰 HEADER
        // ═══════════════════════════════════════
        let newsMessage = `╭━━━━━━━━━━━━━━━━━━╮\n`;
        newsMessage += `┃  ✦ 📰 ᴛᴏᴘ ʜᴇᴀᴅʟɪɴᴇꜱ\n`;
        newsMessage += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;
        newsMessage += `▸ 📊 ᴛᴏᴛᴀʟ : ${totalResults} ᴀʀᴛɪᴄʟᴇꜱ\n`;
        newsMessage += `▸ 🌍 ᴄᴏᴜɴᴛʀʏ : ᴜɴɪᴛᴇᴅ ꜱᴛᴀᴛᴇꜱ\n`;
        newsMessage += `▸ 📄 ꜱʜᴏᴡɪɴɢ : ${articles.length} ɴᴇᴡꜱ\n`;
        newsMessage += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;

        // ═══════════════════════════════════════
        // 📰 ARTICLES
        // ═══════════════════════════════════════
        articles.forEach((article, index) => {
            const title = article.title || 'No Title';
            const description = article.description || 'No description available';
            const source = article.source?.name || 'Unknown Source';
            const newsEmoji = getNewsEmoji(title);

            const shortTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
            const shortDesc = description.length > 100 ? description.substring(0, 97) + '...' : description;

            newsMessage += `▸ ${newsEmoji} ɴᴇᴡꜱ #${index + 1}\n`;
            newsMessage += `▸ 📰 ${shortTitle}\n`;
            newsMessage += `▸ 📝 ${shortDesc}\n`;
            newsMessage += `▸ 📡 ꜱᴏᴜʀᴄᴇ : ${source}\n`;
            newsMessage += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
        });

        newsMessage += `   👑 𝗕𝘆 : 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫`;

        // 🗑️ Delete loading message
        try {
            await sock.sendMessage(chatId, {
                delete: {
                    remoteJid: chatId,
                    fromMe: true,
                    id: loadingMsg.key.id
                }
            });
        } catch (e) {}

        // 📤 Send final news
        await sock.sendMessage(chatId, {
            text: newsMessage,
            ...channelInfo
        }, { quoted: message });

        await addReaction(sock, message, '✅');

    } catch (error) {
        console.error('Error fetching news:', error);
        await addReaction(sock, message, '❌');

        let errorLine = 'ꜱᴏᴍᴇᴛʜɪɴɢ ᴡᴇɴᴛ ᴡʀᴏɴɢ';
        if (error.response?.status === 401) errorLine = 'ɪɴᴠᴀʟɪᴅ ᴀᴘɪ ᴋᴇʏ';
        else if (error.response?.status === 429) errorLine = 'ʀᴀᴛᴇ ʟɪᴍɪᴛ ᴇxᴄᴇᴇᴅᴇᴅ';
        else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) errorLine = 'ʀᴇǫᴜᴇꜱᴛ ᴛɪᴍᴇᴅ ᴏᴜᴛ';
        else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) errorLine = 'ɴᴏ ɪɴᴛᴇʀɴᴇᴛ ᴄᴏɴɴᴇᴄᴛɪᴏɴ';

        await sock.sendMessage(chatId, {
            text: box('❌ ɴᴇᴡꜱ ᴇʀʀᴏʀ', [
                `🔴 ${errorLine}`,
                '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = newsCommand;