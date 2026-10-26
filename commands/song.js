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
//                    🚀 MAIN SONG COMMAND (ULTRA FAST)
// ═══════════════════════════════════════════════════════════
async function songCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🎵');

        // Handle all message types
        const messageContent = message.message?.ephemeralMessage?.message || 
                              message.message?.viewOnceMessage?.message || 
                              message.message?.viewOnceMessageV2?.message || 
                              message.message;
        
        const text = (messageContent.conversation || 
                     messageContent.extendedTextMessage?.text || 
                     messageContent.imageMessage?.caption || 
                     messageContent.videoMessage?.caption || '').trim();
        
        const query = text.replace(/^\.(?:song|play|music|mp3|ytmp3)\s+/i, '').trim();

        // ❌ No query
        if (!query || query.toLowerCase() === '.song') {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🎵 ꜱᴏɴɢ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ', [
                    '📌 ᴜꜱᴀɢᴇ : .song [name/link]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ 1 : .song atif aslam',
                    '🔗 ᴇxᴀᴍᴘʟᴇ 2 : .song https://youtu.be/xxxxx',
                    '━━━━━━━━━━━━━━━━━━',
                    '⚡ ᴍᴏᴅᴇ : ᴜʟᴛʀᴀ ꜰᴀꜱᴛ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '⏳');

        // ═══════════════════════════════════════
        // STEP 1: SEARCH / URL DETECT
        // ═══════════════════════════════════════
        let video;
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            const videoIdMatch = query.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            if (videoIdMatch) {
                const videoId = videoIdMatch[1];
                const searchData = await yts({ videoId });
                video = {
                    url: `https://youtu.be/${videoId}`,
                    title: searchData?.title || 'YouTube Audio',
                    thumbnail: searchData?.thumbnail || 'https://i.ibb.co/zhBH3mzR/file-000000002ae08211834774ce8bc71642.png',
                    timestamp: searchData?.timestamp || 'N/A',
                    author: searchData?.author?.name || 'Unknown'
                };
            } else {
                video = { 
                    url: query, 
                    title: 'YouTube Audio', 
                    thumbnail: 'https://i.ibb.co/zhBH3mzR/file-000000002ae08211834774ce8bc71642.png',
                    timestamp: 'N/A',
                    author: 'Unknown'
                };
            }
        } else {
            const search = await yts(query);
            if (!search || !search.videos.length) {
                await addReaction(sock, message, '❌');
                return await sock.sendMessage(chatId, {
                    text: box('❌ ɴᴏ ʀᴇꜱᴜʟᴛꜱ', [
                        `🔍 ɴᴏ ꜱᴏɴɢꜱ ꜰᴏᴜɴᴅ ꜰᴏʀ : ${query}`,
                        '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ᴋᴇʏᴡᴏʀᴅꜱ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            }
            video = {
                url: search.videos[0].url,
                title: search.videos[0].title,
                thumbnail: search.videos[0].thumbnail,
                timestamp: search.videos[0].timestamp,
                author: search.videos[0].author?.name || 'Unknown'
            };
        }

        // ═══════════════════════════════════════
        // STEP 2: API FETCH
        // ═══════════════════════════════════════
        let apiData;
        try {
            apiData = await getArslanData(video.url);
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
        // 🖼️ STEP 3: THUMBNAIL + BACKGROUND DOWNLOAD (ULTRA FAST)
        // ═══════════════════════════════════════
        await addReaction(sock, message, '🖼️');

        // Start download in parallel
        const bufferPromise = downloadBuffer(apiData.audio);

        try {
            await sock.sendMessage(chatId, {
                image: { url: video.thumbnail },
                caption: box('🎵 ꜱᴏɴɢ ꜰᴏᴜɴᴅ', [
                    `📌 ᴛɪᴛʟᴇ : ${trim(apiData.title, 38)}`,
                    `⏱️ ᴅᴜʀᴀᴛɪᴏɴ : ${video.timestamp}`,
                    `📺 ᴄʜᴀɴɴᴇʟ : ${trim(video.author, 25)}`,
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

            // ✅ Fallback: Direct URL
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
        console.log(`✅ Song sent: ${apiData.title}`);

    } catch (err) {
        console.error('Song command error:', err);
        await addReaction(sock, message, '❌');

        let errorMsg = err.message || 'Unknown error';
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

module.exports = songCommand;
