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

// 💎 VIP DESIGN FRAME (BOLD CLEAN)
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
//                    🔍 SEARCH (yt-search)
// ═══════════════════════════════════════════════════════════
async function searchSong(query) {
    const { videos } = await yts(query);
    if (!videos || videos.length === 0) throw new Error('No results');
    
    const v = videos[0];
    return {
        title: v.title,
        url: v.url,
        videoId: v.videoId,
        thumbnail: v.thumbnail,
        timestamp: v.timestamp,
        views: v.views,
        author: v.author?.name || 'Unknown'
    };
}

// ═══════════════════════════════════════════════════════════
//                    🎵 ARSLAN API (AUDIO + META)
// ═══════════════════════════════════════════════════════════
async function getArslanData(youtubeUrl) {
    const apiUrl = `${API_BASE}${encodeURIComponent(youtubeUrl)}`;
    const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.data.status || !response.data.result?.download?.url) {
        throw new Error('API failed to fetch audio');
    }

    const result = response.data.result;
    return {
        title: result.metadata?.title || 'Audio',
        duration: result.metadata?.duration || 0,
        quality: result.metadata?.quality || '128k',
        audio: result.download.url
    };
}

// ═══════════════════════════════════════════════════════════
//                    📥 BUFFER DOWNLOAD (ULTRA FAST)
// ═══════════════════════════════════════════════════════════
async function downloadBuffer(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        decompress: false,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'audio/mpeg,audio/*,*/*;q=0.8',
            'Accept-Encoding': 'identity',
            'Connection': 'keep-alive'
        }
    });

    const buffer = Buffer.from(response.data);
    if (!buffer || buffer.length === 0) throw new Error('Empty buffer');
    return buffer;
}

// ═══════════════════════════════════════════════════════════
//                    🚀 MAIN PLAY COMMAND (ULTRA FAST)
// ═══════════════════════════════════════════════════════════
async function playCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🎵');

        const text = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text || '';
        
        const query = text.replace(/^\.(?:play|song|music|mp3|ytmp3)\b/i, '').trim();

        // ❌ No query
        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🎵 ᴘʟᴀʏ ᴄᴏᴍᴍᴀɴᴅ', [
                    '📌 ᴜꜱᴀɢᴇ : .play [song name]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ 1 : .play pasoori',
                    '🔍 ᴇxᴀᴍᴘʟᴇ 2 : .play atif aslam',
                    '━━━━━━━━━━━━━━━━━━',
                    '⚡ ᴍᴏᴅᴇ : ᴜʟᴛʀᴀ ꜰᴀꜱᴛ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ═══════════════════════════════════════
        // STEP 1: SEARCH
        // ═══════════════════════════════════════
        await addReaction(sock, message, '🔍');

        let songData;
        try {
            songData = await searchSong(query);
        } catch (err) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ʀᴇꜱᴜʟᴛꜱ', [
                    `🔍 ɴᴏ ꜱᴏɴɢ ꜰᴏᴜɴᴅ ꜰᴏʀ : ${query}`,
                    '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ᴋᴇʏᴡᴏʀᴅꜱ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ═══════════════════════════════════════
        // STEP 2: API FETCH (DOWNLOAD URL)
        // ═══════════════════════════════════════
        await addReaction(sock, message, '⏳');

        let apiData;
        try {
            apiData = await getArslanData(songData.url);
        } catch (err) {
            console.error('API failed:', err.message);
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ᴀᴘɪ ꜰᴀɪʟᴇᴅ', [
                    '🔴 ᴀᴜᴅɪᴏ ᴀᴘɪ ꜰᴀɪʟᴇᴅ',
                    '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ꜱᴏɴɢ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ═══════════════════════════════════════
        // 🖼️ STEP 3: THUMBNAIL + BACKGROUND BUFFER (PARALLEL)
        // ═══════════════════════════════════════
        await addReaction(sock, message, '🖼️');

        // Start download in parallel (ultra-fast)
        const bufferPromise = downloadBuffer(apiData.audio);

        try {
            await sock.sendMessage(chatId, {
                image: { url: songData.thumbnail },
                caption: box('🎵 ꜱᴏɴɢ ꜰᴏᴜɴᴅ', [
                    `📌 ᴛɪᴛʟᴇ : ${trim(apiData.title, 38)}`,
                    `⏱️ ᴅᴜʀᴀᴛɪᴏɴ : ${songData.timestamp || 'N/A'}`,
                    `📺 ᴄʜᴀɴɴᴇʟ : ${trim(songData.author, 25)}`,
                    `🎚️ ǫᴜᴀʟɪᴛʏ : ${apiData.quality}`,
                    '━━━━━━━━━━━━━━━━━━',
                    '⚡ ᴜʟᴛʀᴀ ꜰᴀꜱᴛ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...'
                ]),
                ...channelInfo
            }, { quoted: message });
        } catch (thumbErr) {
            console.error('Thumbnail error:', thumbErr.message);
        }

        // ═══════════════════════════════════════
        // STEP 4: AWAIT BUFFER
        // ═══════════════════════════════════════
        await addReaction(sock, message, '📥');

        let audioBuffer;
        try {
            audioBuffer = await bufferPromise;
        } catch (bufferErr) {
            console.error('Buffer failed:', bufferErr.message);

            // ✅ Fallback: direct URL
            try {
                await sock.sendMessage(chatId, {
                    audio: { url: apiData.audio },
                    mimetype: 'audio/mpeg',
                    fileName: `${apiData.title.replace(/[^\w\s-]/g, '')}.mp3`,
                    ptt: false,
                    ...channelInfo
                }, { quoted: message });

                await addReaction(sock, message, '✅');
                return;
            } catch (urlErr) {
                await addReaction(sock, message, '❌');
                return await sock.sendMessage(chatId, {
                    text: box('❌ ꜰᴀɪʟᴇᴅ', [
                        '🔴 ᴄᴏᴜʟᴅ ɴᴏᴛ ᴅᴏᴡɴʟᴏᴀᴅ',
                        '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ꜱᴏɴɢ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            }
        }

        // ═══════════════════════════════════════
        // STEP 5: SEND AUDIO
        // ═══════════════════════════════════════
        const fileName = `${apiData.title.replace(/[^\w\s-]/g, '')}.mp3`;

        await sock.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: fileName,
            ptt: false,
            ...channelInfo
        }, { quoted: message });

        await addReaction(sock, message, '✅');

    } catch (error) {
        console.error('❌ Play error:', error);
        await addReaction(sock, message, '❌');

        let errorMsg = error.message || 'Unknown error';
        if (errorMsg.length > 80) errorMsg = errorMsg.substring(0, 80) + '...';

        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [
                `🔴 ${errorMsg}`,
                '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = playCommand;
