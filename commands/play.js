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

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
};

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

async function tryRequest(getter, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await getter();
        } catch (err) {
            lastError = err;
            if (attempt < attempts) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }
    throw lastError;
}

// ═══════════════════════════════════════════════════════════
//                    🔍 SEARCH (yt-search)
// ═══════════════════════════════════════════════════════════
async function searchSong(query) {
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
        return {
            title: 'YouTube Audio',
            url: query,
            thumbnail: 'https://i.postimg.cc/y6GV9P3H/file-000000004c307206bc366893b817568c-(1).png',
            timestamp: 'N/A',
            author: 'YouTube'
        };
    }

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
//                    🎵 MULTI-API FALLBACK CHAIN
// ═══════════════════════════════════════════════════════════
async function getEliteProTechDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(youtubeUrl)}&format=mp3`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.downloadURL) {
        return { download: res.data.downloadURL, title: res.data.title };
    }
    throw new Error('EliteProTech returned no download');
}

async function getYupraDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.data?.download_url) {
        return {
            download: res.data.data.download_url,
            title: res.data.data.title,
            thumbnail: res.data.data.thumbnail
        };
    }
    throw new Error('Yupra returned no download');
}

async function getOkatsuDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.dl) {
        return {
            download: res.data.dl,
            title: res.data.title,
            thumbnail: res.data.thumb
        };
    }
    throw new Error('Okatsu returned no download');
}

async function getAlyaDownloadByUrl(youtubeUrl) {
    const res = await tryRequest(() => axios.get(
        `https://api.alyachan.pro/api/ytmp3?url=${encodeURIComponent(youtubeUrl)}&apikey=G7I6X7`,
        AXIOS_DEFAULTS
    ));
    if (res.data.status && res.data.data.url) {
        return { download: res.data.data.url, title: res.data.data.title };
    }
    throw new Error('Alya failed');
}

async function getVredenDownloadByUrl(youtubeUrl) {
    const res = await tryRequest(() => axios.get(
        `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(youtubeUrl)}`,
        AXIOS_DEFAULTS
    ));
    if (res.data.status && res.data.result.download.url) {
        return {
            download: res.data.result.download.url,
            title: res.data.result.metadata.title
        };
    }
    throw new Error('Vreden failed');
}

const API_METHODS = [
    { name: 'EliteProTech', method: getEliteProTechDownloadByUrl },
    { name: 'Yupra',        method: getYupraDownloadByUrl },
    { name: 'Okatsu',       method: getOkatsuDownloadByUrl },
    { name: 'Alya',         method: getAlyaDownloadByUrl },
    { name: 'Vreden',       method: getVredenDownloadByUrl }
];

// ═══════════════════════════════════════════════════════════
//                    📥 BUFFER DOWNLOAD
// ═══════════════════════════════════════════════════════════
async function downloadBuffer(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 120000,
        maxContentLength: 100 * 1024 * 1024,
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
//                    🚀 MAIN PLAY COMMAND
// ═══════════════════════════════════════════════════════════
async function playCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🎧');

        const messageContent =
            message.message?.ephemeralMessage?.message ||
            message.message?.viewOnceMessage?.message ||
            message.message?.viewOnceMessageV2?.message ||
            message.message;

        const text = (
            messageContent?.conversation ||
            messageContent?.extendedTextMessage?.text ||
            messageContent?.imageMessage?.caption ||
            messageContent?.videoMessage?.caption ||
            ''
        ).trim();

        const query = text.replace(/^\.(?:play|music|mp3|ytmp3|song)\b/i, '').trim();

        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🎧 ᴘʟᴀʏ ᴍᴜꜱɪᴄ', [
                    '📌 ᴜꜱᴀɢᴇ : .ᴘʟᴀʏ [ꜱᴏɴɢ ɴᴀᴍᴇ/ʟɪɴᴋ]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ 1 : .ᴘʟᴀʏ ᴘᴀꜱᴏᴏʀɪ',
                    '🔍 ᴇxᴀᴍᴘʟᴇ 2 : .ᴘʟᴀʏ ʟᴇʟᴇɴᴀ',
                    '━━━━━━━━━━━━━━━━━━',
                    '⚡ ᴍᴏᴅᴇ : ᴍᴜʟᴛɪ-ᴀᴘɪ ꜰᴀʟʟʙᴀᴄᴋ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // STEP 1: SEARCH
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

        // STEP 2: THUMBNAIL PREVIEW
        await addReaction(sock, message, '🖼️');

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

        // STEP 3: MULTI-API FALLBACK DOWNLOAD
        await addReaction(sock, message, '📥');

        let audioBuffer = null;
        let finalTitle = songData.title;
        let lastError = null;

        for (const api of API_METHODS) {
            try {
                const audioData = await api.method(songData.url);
                if (!audioData?.download) throw new Error('No download URL');

                finalTitle = audioData.title || songData.title;
                audioBuffer = await downloadBuffer(audioData.download);

                if (audioBuffer && audioBuffer.length > 0) {
                    console.log(`✅ Downloaded via ${api.name}`);
                    break;
                }
                throw new Error('Empty buffer');
            } catch (err) {
                lastError = err;
                console.log(`❌ ${api.name} failed:`, err.message);
            }
        }

        if (!audioBuffer) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ᴘʟᴀʏ ꜰᴀɪʟᴇᴅ', [
                    '🔴 ᴀʟʟ ᴀᴘɪ ꜱᴏᴜʀᴄᴇꜱ ꜰᴀɪʟᴇᴅ',
                    `⚠️ ${trim(lastError?.message || 'Unknown', 60)}`,
                    '💡 ᴛʀʏ ᴅɪꜰꜰᴇʀᴇɴᴛ ꜱᴏɴɢ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // STEP 4: SEND AUDIO DIRECTLY
        await sock.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${finalTitle.replace(/[^\w\s-]/g, '')}.mp3`,
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
