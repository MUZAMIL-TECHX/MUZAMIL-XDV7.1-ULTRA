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
const MAX_AUDIO_BYTES = 64 * 1024 * 1024;

// ═══════════════════════════════════════════════════════════
//                    🛠️ HELPERS & VIP DESIGN
// ═══════════════════════════════════════════════════════════
async function addReaction(sock, message, emoji) {
    try {
        await sock.sendMessage(message.key.remoteJid, {
            react: { text: emoji, key: message.key }
        });
    } catch (error) {
        console.error('Reaction error:', error.code || error.message);
    }
}

function box(title, lines = []) {
    let out = `╭━━━━━━━━━━━━━━━━━━╮\n`;
    out += `┃  ✦ ${title}\n`;
    out += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;
    for (const line of lines) out += `▸ ${line}\n`;
    out += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    out += `   👑 𝗕𝘆 : 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫`;
    return out;
}

function trim(value, maxLength) {
    if (!value) return 'Unknown';
    const text = String(value);
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function getMessageText(message) {
    let content = message.message || {};
    for (let i = 0; i < 3; i += 1) {
        const wrapped = content.ephemeralMessage?.message ||
            content.viewOnceMessage?.message ||
            content.viewOnceMessageV2?.message;
        if (!wrapped) break;
        content = wrapped;
    }
    return (
        content.conversation ||
        content.extendedTextMessage?.text ||
        content.imageMessage?.caption ||
        content.videoMessage?.caption ||
        ''
    ).trim();
}

function safeFileName(title) {
    const base = String(title || 'audio')
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100);
    return `${base || 'audio'}.mp3`;
}

function streamHttpError(status) {
    const reason = status === 404
        ? 'the link may be short-lived or invalid'
        : status === 403
            ? 'the provider denied access (Bypassed using Proxy)'
            : 'the provider could not find the audio';
    const error = new Error(`Audio host returned HTTP ${status}; ${reason}.`);
    error.statusCode = status;
    return error;
}

function isYouTubeUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'https:' &&
            (parsed.hostname === 'youtu.be' ||
                parsed.hostname === 'youtube.com' ||
                parsed.hostname.endsWith('.youtube.com'));
    } catch {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════
//                    🎵 FETCH API
// ═══════════════════════════════════════════════════════════
async function getArslanData(youtubeUrl) {
    let response;
    try {
        response = await axios.get(`${API_BASE}${encodeURIComponent(youtubeUrl)}`, {
            timeout: 30000,
            maxRedirects: 3,
            headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
            validateStatus: () => true
        });
    } catch (error) {
        const reason = error.code === 'ECONNABORTED' ? 'request timed out' : 'network/DNS error';
        throw new Error(`Download API could not be reached (${reason}).`);
    }

    if (response.status < 200 || response.status >= 300) {
        throw new Error(`Download API returned HTTP ${response.status}.`);
    }

    const result = response.data?.result;
    if (!response.data?.status || !result?.download?.url) {
        throw new Error('Download API did not return an audio link. Try again later.');
    }

    let audioUrl;
    try {
        audioUrl = new URL(result.download.url);
    } catch {
        throw new Error('Download API returned an invalid audio link.');
    }
    if (audioUrl.protocol !== 'https:' || audioUrl.username || audioUrl.password) {
        throw new Error('Download API returned an unsupported audio link (HTTPS is required).');
    }

    return {
        title: result.metadata?.title || 'Audio',
        quality: result.metadata?.quality || 'Unknown',
        audio: audioUrl.href
    };
}

// ═══════════════════════════════════════════════════════════
//                    📥 ULTRA FAST BUFFER (PROXY BYPASS)
// ═══════════════════════════════════════════════════════════
async function downloadBuffer(url) {
    // 🔥 Proxy Bypass for Railway (Fixes 123tokyo 403 Error)
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    let response;
    try {
        response = await axios.get(proxyUrl, {
            responseType: 'arraybuffer',
            timeout: 90000, // 1.5 Mins
            maxRedirects: 3,
            maxContentLength: MAX_AUDIO_BYTES,
            maxBodyLength: MAX_AUDIO_BYTES,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*'
            },
            validateStatus: () => true
        });
    } catch (error) {
        if (error.response?.status) {
            throw streamHttpError(error.response.status);
        }
        if (error.code === 'ERR_BAD_RESPONSE' || /maxContentLength/i.test(error.message || '')) {
            throw new Error('The audio file exceeds the 64 MB limit.');
        }
        const reason = error.code === 'ECONNABORTED' ? 'download timed out' : 'audio host could not be reached';
        throw new Error(`${reason}. Check the provider link and try again.`);
    }

    if (response.status < 200 || response.status >= 300) {
        throw streamHttpError(response.status);
    }

    const contentType = String(response.headers?.['content-type'] || '').toLowerCase();
    if (/text\/html|application\/json|text\/plain/.test(contentType)) {
        throw new Error('Audio host returned a webpage instead of MP3 audio. The link may have expired.');
    }

    const buffer = Buffer.from(response.data || []);
    if (!buffer.length) throw new Error('Audio host returned an empty file.');
    if (buffer.length > MAX_AUDIO_BYTES) throw new Error('The audio file exceeds the 64 MB limit.');
    return buffer;
}

// ═══════════════════════════════════════════════════════════
//                    🖼️ SEND INFO
// ═══════════════════════════════════════════════════════════
async function sendInfo(sock, chatId, message, video, apiData) {
    if (!video.thumbnail) return;
    try {
        await sock.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: box('🎵 ꜱᴏɴɢ ꜰᴏᴜɴᴅ', [
                `📌 ᴛɪᴛʟᴇ : ${trim(apiData.title, 38)}`,
                `⏱️ ᴅᴜʀᴀᴛɪᴏɴ : ${video.timestamp || 'N/A'}`,
                `📺 ᴄʜᴀɴɴᴇʟ : ${trim(video.author?.name || video.author, 25)}`,
                `🎚️ ǫᴜᴀʟɪᴛʏ : ${apiData.quality}`,
                '━━━━━━━━━━━━━━━━━━',
                '⚡ ᴜʟᴛʀᴀ ꜰᴀꜱᴛ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...'
            ]),
            ...channelInfo
        }, { quoted: message });
    } catch {
        // Thumbnail optional
    }
}

// ═══════════════════════════════════════════════════════════
//                    🚀 MAIN PLAY COMMAND
// ═══════════════════════════════════════════════════════════
async function playCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🎵');
        const text = getMessageText(message);
        const query = text.replace(/^\.(?:play|song|music|mp3|ytmp3)\b/i, '').trim();

        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🎵 ᴘʟᴀʏ ᴄᴏᴍᴍᴀɴᴅ', [
                    '📌 ᴜꜱᴀɢᴇ : .play [song name/link]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .play pasoori'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '🔍');
        
        // 1. YouTube Search
        let video;
        if (isYouTubeUrl(query)) {
            video = { url: query, title: 'YouTube Audio', timestamp: 'N/A', author: 'Unknown' };
        } else {
            let search;
            try {
                search = await yts(query);
            } catch {
                throw new Error('YouTube search is temporarily unavailable. Try again shortly.');
            }
            if (!search?.videos?.length) {
                await addReaction(sock, message, '❌');
                return await sock.sendMessage(chatId, {
                    text: box('❌ ɴᴏ ʀᴇꜱᴜʟᴛꜱ', [`🔍 ɴᴏ ꜱᴏɴɢ ꜰᴏᴜɴᴅ ꜰᴏʀ : ${trim(query, 80)}`]),
                    ...channelInfo
                }, { quoted: message });
            }
            video = search.videos[0];
        }

        await addReaction(sock, message, '⏳');

        // 2. Fetch API
        let apiData = await getArslanData(video.url);
        
        await addReaction(sock, message, '📥');

        // 3. Ultra Fast Download (Proxy)
        let audioBuffer;
        try {
            audioBuffer = await downloadBuffer(apiData.audio);
        } catch (error) {
            if (error.statusCode !== 404 && error.statusCode !== 403) throw error;
            // Ask provider for one fresh link
            apiData = await getArslanData(video.url);
            audioBuffer = await downloadBuffer(apiData.audio);
        }

        // 4. Send Thumbnail
        await sendInfo(sock, chatId, message, video, apiData);

        // 5. Send Audio
        await sock.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: safeFileName(apiData.title),
            ptt: false,
            ...channelInfo
        }, { quoted: message });
        
        await addReaction(sock, message, '✅');

    } catch (error) {
        console.error('Play command failed:', error.code || error.message);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [`🔴 ${trim(error.message || 'Unknown error', 180)}`]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = playCommand;
