const axios = require('axios');
const yts = require('yt-search');

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

const API_BASE = 'https://arslan-apis-v2.vercel.app/download/ytmp3?url=';

// ═══════════════════════════════════════════════════════════
//                    🛠️ HELPERS & VIP DESIGN
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

function trim(str, n) {
    if (!str) return 'Unknown';
    return str.length > n ? str.slice(0, n) + '...' : str;
}

// ═══════════════════════════════════════════════════════════
//                    🎵 FETCH API
// ═══════════════════════════════════════════════════════════
async function getArslanData(youtubeUrl) {
    const apiUrl = `${API_BASE}${encodeURIComponent(youtubeUrl)}`;
    const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.data?.status || !response.data?.result?.download?.url) {
        throw new Error('API returned invalid data');
    }

    const result = response.data.result;
    return {
        title: result.metadata?.title || 'Audio',
        quality: result.metadata?.quality || '128k',
        audio: result.download.url
    };
}

// ═══════════════════════════════════════════════════════════
//                    📥 ULTRA FAST BUFFER (PROXY FIX)
// ═══════════════════════════════════════════════════════════
async function downloadBuffer(url) {
    // 🔥 Cloudflare Proxy bypass to prevent 403 Forbidden from 123tokyo
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const response = await axios.get(proxyUrl, {
        responseType: 'arraybuffer',
        timeout: 90000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*'
        }
    });

    const buffer = Buffer.from(response.data);
    if (!buffer || buffer.length === 0) throw new Error('Empty buffer received');
    return buffer;
}

// ═══════════════════════════════════════════════════════════
//                    🚀 MAIN PLAY COMMAND
// ═══════════════════════════════════════════════════════════
async function playCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🎵');

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = text.replace(/^\.(?:play|song|music|mp3|ytmp3)\b/i, '').trim();

        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🎵 ᴘʟᴀʏ ᴄᴏᴍᴍᴀɴᴅ', [
                    '📌 ᴜꜱᴀɢᴇ : .play [song name]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .play pasoori'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '🔍');

        // 1. YouTube Search
        let songData;
        try {
            const { videos } = await yts(query);
            if (!videos || videos.length === 0) throw new Error('No results');
            songData = videos[0];
        } catch (err) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ʀᴇꜱᴜʟᴛꜱ', [`🔍 ɴᴏ ꜱᴏɴɢ ꜰᴏᴜɴᴅ ꜰᴏʀ : ${query}`]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '⏳');

        // 2. Fetch API
        let apiData;
        try {
            apiData = await getArslanData(songData.url);
        } catch (err) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ᴀᴘɪ ꜰᴀɪʟᴇᴅ', [
                    '🔴 ᴀᴘɪ ʀᴇꜱᴘᴏɴꜱᴇ ᴇʀʀᴏʀ',
                    `💡 ${err.message}`
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // 3. Send Thumbnail
        await addReaction(sock, message, '🖼️');
        try {
            await sock.sendMessage(chatId, {
                image: { url: songData.thumbnail },
                caption: box('🎵 ꜱᴏɴɢ ꜰᴏᴜɴᴅ', [
                    `📌 ᴛɪᴛʟᴇ : ${trim(apiData.title, 38)}`,
                    `⏱️ ᴅᴜʀᴀᴛɪᴏɴ : ${songData.timestamp}`,
                    `📺 ᴄʜᴀɴɴᴇʟ : ${trim(songData.author?.name, 25)}`,
                    `🎚️ ǫᴜᴀʟɪᴛʏ : ${apiData.quality}`,
                    '━━━━━━━━━━━━━━━━━━',
                    '⚡ ᴜʟᴛʀᴀ ꜰᴀꜱᴛ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...'
                ]),
                ...channelInfo
            }, { quoted: message });
        } catch (thumbErr) {}

        // 4. Download Audio
        await addReaction(sock, message, '📥');
        let audioBuffer;
        
        try {
            audioBuffer = await downloadBuffer(apiData.audio);
        } catch (bufferErr) {
            console.error('Buffer failed:', bufferErr.message);
            // Fallback: Direct URL (might work sometimes)
            await sock.sendMessage(chatId, {
                audio: { url: apiData.audio },
                mimetype: 'audio/mpeg',
                fileName: `${apiData.title.replace(/[^\w\s-]/g, '')}.mp3`,
                ptt: false,
                ...channelInfo
            }, { quoted: message });
            await addReaction(sock, message, '✅');
            return;
        }

        // 5. Send Audio
        await sock.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${apiData.title.replace(/[^\w\s-]/g, '')}.mp3`,
            ptt: false,
            ...channelInfo
        }, { quoted: message });

        await addReaction(sock, message, '✅');

    } catch (error) {
        console.error('❌ Play error:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [`🔴 ${error.message || 'Unknown error'}`]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = playCommand;
