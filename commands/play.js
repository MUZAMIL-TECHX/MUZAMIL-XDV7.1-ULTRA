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

const HECTOR_API = 'https://yt-dl.officialhectormanuel.workers.dev/?url=';

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
        thumbnail: v.thumbnail,
        timestamp: v.timestamp,
        author: v.author?.name || 'Unknown'
    };
}

// ═══════════════════════════════════════════════════════════
//                    🎵 HECTOR API
// ═══════════════════════════════════════════════════════════
async function getHectorData(youtubeUrl) {
    const apiUrl = `${HECTOR_API}${encodeURIComponent(youtubeUrl)}`;
    const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.data.status || !response.data.audio) {
        throw new Error('Hector API failed');
    }

    return {
        audio: response.data.audio
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
        await addReaction(sock, message, '🎧');

        const text = message.message?.conversation ||
                     message.message?.extendedTextMessage?.text || '';

        const query = text.replace(/^\.(?:play|music|mp3|ytmp3)\b/i, '').trim();

        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🎧 ᴘʟᴀʏ ᴍᴜꜱɪᴄ', [
                    '📌 ᴜꜱᴀɢᴇ : .ᴘʟᴀʏ [ꜱᴏɴɢ ɴᴀᴍᴇ/ʟɪɴᴋ]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ 1 : .ᴘʟᴀʏ ᴘᴀꜱᴏᴏʀɪ',
                    '🔍 ᴇxᴀᴍᴘʟᴇ 2 : .ᴘʟᴀʏ ʟᴇʟᴇɴᴀ',
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
        } catch (searchError) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ᴛʀᴀᴄᴋꜱ', [
                    `🔍 ɴᴏ ᴛʀᴀᴄᴋ ꜰᴏᴜɴᴅ ꜰᴏʀ : ${query}`,
                    '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ᴋᴇʏᴡᴏʀᴅꜱ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '⏳');

        // ═══════════════════════════════════════
        // STEP 2: HECTOR API
        // ═══════════════════════════════════════
        let hectorData;
        try {
            hectorData = await getHectorData(songData.url);
        } catch (apiError) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ᴘʟᴀʏ ꜰᴀɪʟᴇᴅ', [
                    '🔴 ᴀᴜᴅɪᴏ ꜱᴛʀᴇᴀᴍ ꜰᴀɪʟᴇᴅ',
                    '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ꜱᴏɴɢ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ═══════════════════════════════════════
        // STEP 3: THUMBNAIL + START DOWNLOAD (PARALLEL)
        // ═══════════════════════════════════════
        await addReaction(sock, message, '🖼️');

        // Start buffer download in background
        const bufferPromise = downloadBuffer(hectorData.audio);

        // Thumbnail foran bhejo
        try {
            await sock.sendMessage(chatId, {
                image: { url: songData.thumbnail },
                caption: box('🎧 ᴛʀᴀᴄᴋ ꜰᴏᴜɴᴅ', [
                    `📌 ᴛɪᴛʟᴇ : ${trim(songData.title, 38)}`,
                    `⏱️ ᴅᴜʀᴀᴛɪᴏɴ : ${songData.timestamp || 'N/A'}`,
                    `📺 ᴄʜᴀɴɴᴇʟ : ${trim(songData.author, 25)}`,
                    '━━━━━━━━━━━━━━━━━━',
                    '🎶 ᴘʀᴇᴘᴀʀɪɴɢ ᴛʀᴀᴄᴋ...'
                ]),
                ...channelInfo
            }, { quoted: message });
        } catch (thumbError) {
            console.error('Thumbnail error:', thumbError.message);
        }

        // ═══════════════════════════════════════
        // STEP 4: AWAIT BUFFER
        // ═══════════════════════════════════════
        await addReaction(sock, message, '📥');

        let audioBuffer;
        try {
            audioBuffer = await bufferPromise;
        } catch (bufferError) {
            console.error('Buffer failed:', bufferError.message);

            // Fallback: direct URL
            try {
                await sock.sendMessage(chatId, {
                    audio: { url: hectorData.audio },
                    mimetype: 'audio/mpeg',
                    fileName: `${songData.title.replace(/[^\w\s-]/g, '')}.mp3`,
                    ptt: false,
                    ...channelInfo
                }, { quoted: message });

                await addReaction(sock, message, '✅');
                return;
            } catch (urlError) {
                await addReaction(sock, message, '❌');
                return await sock.sendMessage(chatId, {
                    text: box('❌ ᴇʀʀᴏʀ', [
                        '🔴 ᴅᴏᴡɴʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ',
                        '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            }
        }

        // ═══════════════════════════════════════
        // STEP 5: SEND AUDIO (FAST)
        // ═══════════════════════════════════════
        await sock.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${songData.title.replace(/[^\w\s-]/g, '')}.mp3`,
            ptt: false,
            ...channelInfo
        }, { quoted: message });

        await addReaction(sock, message, '✅');

    } catch (error) {
        console.error('Play error:', error);
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
