const axios = require('axios');

// ═══════════════════════════════════════════════════════════
//                    🎯 CHANNEL INFO
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
//                    📚 MAIN WIKI COMMAND
// ═══════════════════════════════════════════════════════════
async function wikiCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '📚');

        const text = message.message?.conversation ||
                     message.message?.extendedTextMessage?.text || '';

        // ✅ Sab aliases remove karo
        const query = text
            .replace(/^\.(?:wiki|wp|wikipedia|info|defind|define)\b/i, '')
            .trim();

        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('📚 ᴡɪᴋɪᴘᴇᴅɪᴀ sᴇᴀʀᴄʜ', [
                    '📌 ᴜsᴀɢᴇ : .ᴡɪᴋɪ [ǫᴜᴇʀʏ]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .ᴡɪᴋɪ ᴘᴀᴋɪꜱᴛᴀɴ',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .ᴡᴘ ʟᴀʜᴏʀᴇ',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .ɪɴꜰᴏ ɪɴᴅɪᴀ',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴀʟɪᴀꜱᴇꜱ :',
                    '.ᴡɪᴋɪ / .ᴡᴘ / .ᴡɪᴋɪᴘᴇᴅɪᴀ',
                    '.ɪɴꜰᴏ / .ᴅᴇꜰɪɴᴇ / .ᴅᴇꜰɪɴᴅ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // 🔍 Searching
        await addReaction(sock, message, '🔍');

        const formattedQuery = query.replace(/ /g, "_");

        // ✅ Wikipedia API
        const res = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedQuery)}`,
            {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MUZAMIL-XD-BOT/1.0',
                    'Accept-Language': 'en'
                }
            }
        );

        const data = res.data;

        if (data.extract && data.extract.length > 0) {
            await addReaction(sock, message, '✅');

            // Truncate extract if too long
            const extract = data.extract.length > 800 
                ? data.extract.substring(0, 800) + '...' 
                : data.extract;

            const lines = [
                `📌 ᴛɪᴛʟᴇ : ${data.title}`,
                `📝 ᴛʏᴘᴇ : ${data.type || 'article'}`,
                '━━━━━━━━━━━━━━━━━━',
                `📖 ${extract}`,
                '━━━━━━━━━━━━━━━━━━',
                `🔗 ${data.content_urls?.desktop?.page || 'No link'}`
            ];

            // Send with image (if available)
            if (data.thumbnail?.source) {
                try {
                    await sock.sendMessage(chatId, {
                        image: { url: data.thumbnail.source },
                        caption: box('📚 ᴡɪᴋɪᴘᴇᴅɪᴀ ʀᴇꜱᴜʟᴛ', lines),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                } catch (imgError) {
                    console.error('Image error:', imgError.message);
                }
            }

            // Fallback: Text only
            await sock.sendMessage(chatId, {
                text: box('📚 ᴡɪᴋɪᴘᴇᴅɪᴀ ʀᴇꜱᴜʟᴛ', lines),
                ...channelInfo
            }, { quoted: message });

        } else {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ʀᴇꜱᴜʟᴛꜱ', [
                    `🔴 ɴᴏ ʀᴇꜱᴜʟᴛꜱ ꜰᴏʀ : ${query}`,
                    '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ᴋᴇʏᴡᴏʀᴅꜱ',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .ᴡɪᴋɪ ᴘᴀᴋɪꜱᴛᴀɴ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Wikipedia error:', error.message || error);
        await addReaction(sock, message, '❌');

        let errorMsg = 'No results found or Wikipedia blocked the request.';
        
        if (error.response?.status === 404) {
            errorMsg = 'Article not found. Try different keywords.';
        } else if (error.code === 'ECONNABORTED') {
            errorMsg = 'Request timed out. Try again.';
        } else if (error.message.includes('ENOTFOUND')) {
            errorMsg = 'No internet connection.';
        }

        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [
                `🔴 ${errorMsg}`,
                '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = wikiCommand;