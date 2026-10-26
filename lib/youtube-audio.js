const axios = require('axios');
const yts = require('yt-search');
const { getSessionSettings } = require('./session_data');

const DOWNLOAD_API = 'https://arslan-apis-v2.vercel.app/download/ytmp3';
const MAX_AUDIO_BYTES = 64 * 1024 * 1024;
const DEFAULT_BOT_NAME = '𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫';

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363426106687970@newsletter',
            newsletterName: DEFAULT_BOT_NAME,
            serverMessageId: -1
        }
    }
};

function getMessageText(message) {
    let content = message?.message || {};
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

function trim(value, maxLength) {
    if (!value) return 'Unknown';
    const text = String(value);
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function isYouTubeUrl(value) {
    try {
        const parsed = new URL(value);
        const host = parsed.hostname.toLowerCase();
        return parsed.protocol === 'https:' &&
            (host === 'youtu.be' ||
                host === 'youtube.com' ||
                host.endsWith('.youtube.com'));
    } catch {
        return false;
    }
}

function box(title, lines, botName) {
    return `╭━━━━━━━━━━━━━━━━━━╮
┃  ✦ ${title}
╰━━━━━━━━━━━━━━━━━━╯

${lines.map(line => `▸ ${line}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━
   👑 𝗕𝘆 : ${botName || DEFAULT_BOT_NAME}`;
}

function getCommandQuery(message) {
    return getMessageText(message)
        .replace(/^\.(?:play|song|music|mp3|ytmp3)\b/i, '')
        .trim();
}

async function findVideo(query) {
    if (isYouTubeUrl(query)) {
        return {
            url: query,
            title: 'YouTube Audio',
            timestamp: 'N/A',
            author: 'Unknown',
            thumbnail: ''
        };
    }

    let search;
    try {
        search = await yts(query);
    } catch {
        throw new Error('YouTube search is temporarily unavailable. Try again shortly.');
    }

    if (!search?.videos?.length) return null;
    return search.videos[0];
}

async function getAudioLink(youtubeUrl) {
    const endpoint = new URL(DOWNLOAD_API);
    endpoint.searchParams.set('url', youtubeUrl);

    let response;
    try {
        response = await axios.get(endpoint.toString(), {
            timeout: 30000,
            maxRedirects: 3,
            headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
            validateStatus: () => true
        });
    } catch (error) {
        const reason = error.code === 'ECONNABORTED'
            ? 'request timed out'
            : 'network/DNS error';
        throw new Error(`Download API could not be reached (${reason}).`);
    }

    if (response.status < 200 || response.status >= 300) {
        throw new Error(`Download API returned HTTP ${response.status}.`);
    }

    const result = response.data?.result;
    if ((!response.data?.status && !result?.status) || !result?.download?.url) {
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
        audioUrl: audioUrl.href
    };
}

async function downloadBuffer(audioUrl) {
    let response;
    try {
        // Download the provider's signed URL directly and immediately. A third-party
        // proxy can expire, truncate, or transform the audio response.
        response = await axios.get(audioUrl, {
            responseType: 'arraybuffer',
            timeout: 60000,
            maxRedirects: 3,
            maxContentLength: MAX_AUDIO_BYTES,
            maxBodyLength: MAX_AUDIO_BYTES,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                Accept: 'audio/mpeg, audio/*;q=0.9, application/octet-stream;q=0.8'
            },
            validateStatus: () => true
        });
    } catch (error) {
        if (error.response?.status) {
            const failure = new Error(`Audio host returned HTTP ${error.response.status}.`);
            failure.statusCode = error.response.status;
            throw failure;
        }
        if (error.code === 'ERR_BAD_RESPONSE' || /maxContentLength/i.test(error.message || '')) {
            throw new Error('The audio file exceeds the 64 MB limit.');
        }
        const reason = error.code === 'ECONNABORTED'
            ? 'download timed out'
            : 'audio host could not be reached';
        throw new Error(`${reason}. Check the provider link and try again.`);
    }

    if (response.status < 200 || response.status >= 300) {
        const failure = new Error(`Audio host returned HTTP ${response.status}.`);
        failure.statusCode = response.status;
        throw failure;
    }

    const contentType = String(response.headers?.['content-type'] || '').toLowerCase();
    if (/text\/html|application\/json|text\/plain/.test(contentType)) {
        throw new Error('Audio host returned a webpage/error response instead of MP3 audio. Request a fresh link and try again.');
    }

    const buffer = Buffer.from(response.data || []);
    if (!buffer.length) throw new Error('Audio host returned an empty file.');
    if (buffer.length > MAX_AUDIO_BYTES) throw new Error('The audio file exceeds the 64 MB limit.');
    return buffer;
}

async function downloadYouTubeAudio(youtubeUrl) {
    let lastError;
    for (let attempt = 0; attempt < 2; attempt += 1) {
        const apiData = await getAudioLink(youtubeUrl);
        try {
            const buffer = await downloadBuffer(apiData.audioUrl);
            return { ...apiData, buffer };
        } catch (error) {
            lastError = error;
            // Signed download links can expire between API response and download.
            // Request one fresh link from the same API; never send it through a proxy.
            if (attempt === 0 && (error.statusCode === 404 || error.statusCode === 403)) {
                continue;
            }
            throw error;
        }
    }
    throw lastError || new Error('Audio download failed.');
}

async function addReaction(sock, message, emoji) {
    try {
        await sock.sendMessage(message.key.remoteJid, {
            react: { text: emoji, key: message.key }
        });
    } catch (error) {
        console.error('Audio command reaction failed:', error.code || error.message);
    }
}

async function sendSongInfo(sock, chatId, message, video, audioData, botName) {
    if (!video.thumbnail) return;
    try {
        await sock.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: box('🎵 ꜱᴏɴɢ ꜰᴏᴜɴᴅ', [
                `📌 ᴛɪᴛʟᴇ : ${trim(audioData.title, 38)}`,
                `⏱️ ᴅᴜʀᴀᴛɪᴏɴ : ${video.timestamp || 'N/A'}`,
                `📺 ᴄʜᴀɴɴᴇʟ : ${trim(video.author?.name || video.author, 25)}`,
                `🎚️ ǫᴜᴀʟɪᴛʏ : ${audioData.quality}`,
                '━━━━━━━━━━━━━━━━━━',
                '📥 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴀᴜᴅɪᴏ...'
            ], botName),
            ...channelInfo
        }, { quoted: message });
    } catch {
        // The thumbnail is optional; audio delivery should continue.
    }
}

async function runYoutubeAudioCommand(sock, chatId, message) {
    const botName = getSessionSettings(sock).botName || DEFAULT_BOT_NAME;
    try {
        await addReaction(sock, message, '🎵');
        const query = getCommandQuery(message);
        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🎵 ᴘʟᴀʏ ᴄᴏᴍᴍᴀɴᴅ', [
                    '📌 ᴜsᴀɢᴇ : .play [song name/link]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .play pasoori'
                ], botName),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '🔍');
        const video = await findVideo(query);
        if (!video) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ʀᴇsᴜʟᴛs', [`🔍 ɴᴏ ꜱᴏɴɢ ꜰᴏᴜɴᴅ ꜰᴏʀ : ${trim(query, 80)}`], botName),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '⏳');
        const audioData = await downloadYouTubeAudio(video.url);
        await sendSongInfo(sock, chatId, message, video, audioData, botName);
        await sock.sendMessage(chatId, {
            audio: audioData.buffer,
            mimetype: 'audio/mpeg',
            fileName: safeFileName(audioData.title),
            ptt: false,
            ...channelInfo
        }, { quoted: message });
        await addReaction(sock, message, '✅');
    } catch (error) {
        console.error('YouTube audio command failed:', error.code || error.message);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [trim(error.message || 'Unknown error', 180)], botName),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = {
    isYouTubeUrl,
    getAudioLink,
    downloadBuffer,
    downloadYouTubeAudio,
    runYoutubeAudioCommand
};
