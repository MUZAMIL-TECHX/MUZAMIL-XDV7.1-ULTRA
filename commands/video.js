const axios = require('axios');

// ═══════════════════════════════════════════════════════════
//                    🎯 CHANNEL INFO (FORWARD OFF)
// ═══════════════════════════════════════════════════════════
const channelInfo = {
    contextInfo: {
        forwardingScore: 0,
        isForwarded: false
    }
};

const HECTOR_API = 'https://yt-dl.officialhectormanuel.workers.dev/?url=';

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

// ⚡ NEW DESIGN FRAME
function box(title, lines = []) {
    let out = `┏━━━━━━━━━━━━━━━━━━━┓\n`;
    out += `┃  ${title}\n`;
    out += `┗━━━━━━━━━━━━━━━━━━━┛\n`;
    for (const l of lines) out += `  ▸ ${l}\n`;
    out += `\n┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
    out += `   ⚡ 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫 ⚡`;
    return out;
}

function trim(str, n) {
    if (!str) return 'Unknown';
    return str.length > n ? str.slice(0, n) + '...' : str;
}

// ═══════════════════════════════════════════════════════════
//                    🔍 SEARCH (yt-search)
// ═══════════════════════════════════════════════════════════
async function searchVideo(query) {
    const yts = require('yt-search');
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
//                    🎬 HECTOR API
// ═══════════════════════════════════════════════════════════
async function getHectorData(youtubeUrl) {
    const apiUrl = `${HECTOR_API}${encodeURIComponent(youtubeUrl)}`;
    const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.data.status) throw new Error('Hector API failed');

    return {
        title: response.data.title || 'Video',
        thumbnail: response.data.thumbnail,
        audio: response.data.audio,
        videos: response.data.videos,
        qualities: response.data.available_qualities
    };
}

// ═══════════════════════════════════════════════════════════
//                    📥 BUFFER DOWNLOAD (ULTRA FAST)
// ═══════════════════════════════════════════════════════════
async function downloadBuffer(url) {
    // ⚡ Ultra fast: direct stream to buffer, no decompression delays
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        decompress: false,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'video/mp4,video/*,*/*;q=0.8',
            'Accept-Encoding': 'identity',
            'Connection': 'keep-alive'
        }
    });

    const buffer = Buffer.from(response.data);
    if (!buffer || buffer.length === 0) throw new Error('Empty buffer');
    return buffer;
}

// ═══════════════════════════════════════════════════════════
//                    🚀 MAIN VIDEO COMMAND (ULTRA FAST)
// ═══════════════════════════════════════════════════════════
async function videoCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🎬');

        const text = message.message?.conversation ||
                     message.message?.extendedTextMessage?.text || '';

        const query = text.replace(/^\.(?:video|vid|ytmp4)\b/i, '').trim();

        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🎬 ᴠɪᴅᴇᴏ ᴅʟ', [
                    '📌 ᴜsᴀɢᴇ : .ᴠɪᴅᴇᴏ [ɴᴀᴍᴇ/ʟɪɴᴋ]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ 1 : .ᴠɪᴅᴇᴏ ᴘᴀsᴏᴏʀɪ',
                    '🔍 ᴇxᴀᴍᴘʟᴇ 2 : .ᴠɪᴅᴇᴏ ᴀᴛɪꜰ ᴀsʟᴀᴍ',
                    '━━━━━━━━━━━━━━━━━━',
                    '📺 ǫᴜᴀʟɪᴛʏ : 360ᴘ (ᴅᴇꜰᴀᴜʟᴛ)',
                    '⚡ ᴍᴏᴅᴇ : ᴜʟᴛʀᴀ ꜰᴀsᴛ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ═══════════════════════════════════════
        // STEP 1 & 2 PARALLEL: SEARCH → HECTOR
        // ═══════════════════════════════════════
        await addReaction(sock, message, '🔍');

        let videoData;
        try {
            videoData = await searchVideo(query);
        } catch (searchError) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ʀᴇsᴜʟᴛs', [
                    `🔍 ɴᴏ ᴠɪᴅᴇᴏ ꜰᴏᴜɴᴅ ꜰᴏʀ : ${query}`,
                    '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ᴋᴇʏᴡᴏʀᴅs'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '⏳');

        let hectorData;
        try {
            hectorData = await getHectorData(videoData.url);
        } catch (hectorError) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ꜰᴀɪʟᴇᴅ', [
                    '🔴 ᴀᴘɪ ꜰᴀɪʟᴇᴅ',
                    '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ᴠɪᴅᴇᴏ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ═══════════════════════════════════════
        // STEP 3: THUMBNAIL + START DOWNLOAD (PARALLEL)
        // ═══════════════════════════════════════
        await addReaction(sock, message, '🖼️');

        const videoUrl = hectorData.videos?.['360']
                      || hectorData.videos?.['240']
                      || hectorData.videos?.['144']
                      || hectorData.videos?.['480']
                      || hectorData.videos?.['720'];

        if (!videoUrl) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ᴠɪᴅᴇᴏ ᴜʀʟ', [
                    '🔴 ᴠɪᴅᴇᴏ ʟɪɴᴋ ɴᴏᴛ ꜰᴏᴜɴᴅ',
                    '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ᴠɪᴅᴇᴏ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ⚡ Start buffer download IN PARALLEL with thumbnail send
        const bufferPromise = downloadBuffer(videoUrl);

        // Send thumbnail (don't wait for download to finish)
        try {
            const thumbnailUrl = hectorData.thumbnail || videoData.thumbnail;
            await sock.sendMessage(chatId, {
                image: { url: thumbnailUrl },
                caption: box('🎬 ᴠɪᴅᴇᴏ ꜰᴏᴜɴᴅ', [
                    `📌 ᴛɪᴛʟᴇ : ${trim(hectorData.title, 38)}`,
                    `⏱️ ᴅᴜʀᴀᴛɪᴏɴ : ${videoData.timestamp || 'N/A'}`,
                    `📺 ᴄʜᴀɴɴᴇʟ : ${trim(videoData.author, 25)}`,
                    `📺 ǫᴜᴀʟɪᴛʏ : 360ᴘ`,
                    '━━━━━━━━━━━━━━━━━━',
                    '⚡ ᴜʟᴛʀᴀ ꜰᴀsᴛ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...'
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

        let videoBuffer;
        try {
            videoBuffer = await bufferPromise;
        } catch (bufferError) {
            console.error('Buffer failed:', bufferError.message);

            // Fallback: direct URL
            try {
                await sock.sendMessage(chatId, {
                    video: { url: videoUrl },
                    mimetype: 'video/mp4',
                    fileName: `${hectorData.title.replace(/[^\w\s-]/g, '')}.mp4`,
                    caption: box('✅ ᴠɪᴅᴇᴏ ʀᴇᴀᴅʏ', [
                        `📌 ᴛɪᴛʟᴇ : ${trim(hectorData.title, 30)}`,
                        '📺 ǫᴜᴀʟɪᴛʏ : 360ᴘ',
                        '✅ sᴛᴀᴛᴜs : ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ'
                    ]),
                    ...channelInfo
                }, { quoted: message });

                await addReaction(sock, message, '✅');
                return;
            } catch (urlError) {
                await addReaction(sock, message, '❌');
                return await sock.sendMessage(chatId, {
                    text: box('❌ ꜰᴀɪʟᴇᴅ', [
                        '🔴 ᴄᴏᴜʟᴅ ɴᴏᴛ ᴅᴏᴡɴʟᴏᴀᴅ',
                        '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ᴠɪᴅᴇᴏ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            }
        }

        // ═══════════════════════════════════════
        // STEP 5: SEND VIDEO (ULTRA FAST)
        // ═══════════════════════════════════════
        await sock.sendMessage(chatId, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            fileName: `${hectorData.title.replace(/[^\w\s-]/g, '')}.mp4`,
            caption: box('✅ ᴠɪᴅᴇᴏ ʀᴇᴀᴅʏ', [
                `📌 ᴛɪᴛʟᴇ : ${trim(hectorData.title, 30)}`,
                `📏 sɪᴢᴇ : ${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB`,
                '📺 ǫᴜᴀʟɪᴛʏ : 360ᴘ',
                '⚡ ᴍᴏᴅᴇ : ᴜʟᴛʀᴀ ꜰᴀsᴛ'
            ]),
            ...channelInfo
        }, { quoted: message });

        await addReaction(sock, message, '✅');

    } catch (error) {
        console.error('Video error:', error);
        await addReaction(sock, message, '❌');

        let errorMsg = error.message || 'Unknown error';
        if (errorMsg.length > 80) errorMsg = errorMsg.substring(0, 80) + '...';

        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [
                `🔴 ${errorMsg}`,
                '💡 ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = videoCommand;