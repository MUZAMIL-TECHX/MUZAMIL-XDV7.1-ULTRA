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
//                    📥 ULTRA FAST BUFFER DOWNLOAD (FIXED)
// ═══════════════════════════════════════════════════════════
async function downloadBuffer(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 90000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'identity', // 🔥 Block bypass
            'Range': 'bytes=0-',
            'Connection': 'keep-alive',
            'Referer': 'https://www.youtube.com/'
        }
    });

    const buffer = Buffer.from(response.data);
    if (!buffer || buffer.length === 0) throw new Error('Empty buffer received');
    return buffer;
}

// ═══════════════════════════════════════════════════════════
//                    🚀 MAIN SONG COMMAND
// ═══════════════════════════════════════════════════════════
async function songCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🎵');

        const messageContent = message.message?.ephemeralMessage?.message || 
                              message.message?.viewOnceMessage?.message || 
                              message.message?.viewOnceMessageV2?.message || 
                              message.message;
        
        const text = (messageContent.conversation || 
                     messageContent.extendedTextMessage?.text || 
                     messageContent.imageMessage?.caption || 
                     messageContent.videoMessage?.caption || '').trim();
        
        const query = text.replace(/^\.song\s+/i, '').trim();

        if (!query || query.toLowerCase() === '.song') {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🎵 ꜱᴏɴɢ ᴅʟ', [
                    '📌 ᴜꜱᴀɢᴇ : .song [name/link]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ 1 : .song atif aslam',
                    '🔗 ᴇxᴀᴍᴘʟᴇ 2 : .song https://youtu.be/xxxxx'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '🔍');

        // 1. YouTube Search / URL Detect
        let video;
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            video = { 
                url: query, 
                title: 'YouTube Audio', 
                thumbnail: 'https://i.ibb.co/zhBH3mzR/file-000000002ae08211834774ce8bc71642.png',
                timestamp: 'N/A',
                author: 'Unknown'
            };
        } else {
            const search = await yts(query);
            if (!search || !search.videos.length) {
                await addReaction(sock, message, '❌');
                return await sock.sendMessage(chatId, {
                    text: box('❌ ɴᴏ ʀᴇꜱᴜʟᴛꜱ', [`🔍 ɴᴏ ꜱᴏɴɢꜱ ꜰᴏᴜɴᴅ ꜰᴏʀ : ${query}`]),
                    ...channelInfo
                }, { quoted: message });
            }
            video = search.videos[0];
        }

        await addReaction(sock, message, '⏳');

        // 2. Fetch API
        let apiData;
        try {
            apiData = await getArslanData(video.url);
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

        // 3. Send Thumbnail + Parallel Download
        await addReaction(sock, message, '🖼️');
        const bufferPromise = downloadBuffer(apiData.audio);

        try {
            await sock.sendMessage(chatId, {
                image: { url: video.thumbnail },
                caption: box('🎵 ꜱᴏɴɢ ꜰᴏᴜɴᴅ', [
                    `📌 ᴛɪᴛʟᴇ : ${trim(apiData.title, 38)}`,
                    `⏱️ ᴅᴜʀᴀᴛɪᴏɴ : ${video.timestamp}`,
                    `📺 ᴄʜᴀɴɴᴇʟ : ${trim(video.author?.name, 25)}`,
                    `🎚️ ǫᴜᴀʟɪᴛʏ : ${apiData.quality}`,
                    '━━━━━━━━━━━━━━━━━━',
                    '⚡ ᴜʟᴛʀᴀ ꜰᴀꜱᴛ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...'
                ]),
                ...channelInfo
            }, { quoted: message });
        } catch (thumbErr) {}

        // 4. Download Audio Buffer
        await addReaction(sock, message, '📥');
        let audioBuffer;
        
        try {
            audioBuffer = await bufferPromise;
        } catch (bufferErr) {
            console.error('Buffer failed:', bufferErr.message);
            // Fallback: Direct URL
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
        console.log(`✅ Song sent successfully!`);

    } catch (error) {
        console.error('❌ Song command error:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [`🔴 ${error.message || 'Unknown error'}`]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = songCommand;
