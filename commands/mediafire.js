const axios = require('axios');

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

// ═══════════════════════════════════════════════════════════
//                    💎 VIP DESIGN FRAME (BOLD CLEAN)
// ═══════════════════════════════════════════════════════════
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
//                    🔍 VALIDATION
// ═══════════════════════════════════════════════════════════
function isValidMediafireUrl(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        return hostname === 'mediafire.com' ||
               hostname === 'www.mediafire.com' ||
               hostname === 'm.mediafire.com' ||
               hostname.endsWith('.mediafire.com');
    } catch {
        return false;
    }
}

function formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = parseFloat(bytes);
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// ═══════════════════════════════════════════════════════════
//                    📥 MAIN COMMAND
// ═══════════════════════════════════════════════════════════
async function mediafireCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '📥');

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const url = text.split(' ').slice(1).join(' ').trim();

        // ❌ No URL
        if (!url) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('📥 ᴍᴇᴅɪᴀꜰɪʀᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ', [
                    '📌 ᴜꜱᴀɢᴇ : .mediafire [link]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .mediafire https://www.mediafire.com/file/xxxxx'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ❌ Invalid URL
        if (!isValidMediafireUrl(url)) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɪɴᴠᴀʟɪᴅ ʟɪɴᴋ', [
                    '🔴 ɴᴏᴛ ᴀ ᴠᴀʟɪᴅ ᴍᴇᴅɪᴀꜰɪʀᴇ ʟɪɴᴋ',
                    '💡 ᴘʟᴇᴀꜱᴇ ᴄʜᴇᴄᴋ ᴀɴᴅ ᴛʀʏ ᴀɢᴀɪɴ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '🔄');

        // 📡 API call
        const apiUrl = `https://arslan-apis-v2.vercel.app/download/mfire?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const data = response.data;

        // ❌ API failed
        if (!data.status || !data.result) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ꜰᴀɪʟᴇᴅ', [
                    `🔴 ${data.message || 'Could not fetch file from MediaFire'}`,
                    '💡 ꜰɪʟᴇ ᴍɪɢʜᴛ ʙᴇ ᴘʀɪᴠᴀᴛᴇ ᴏʀ ᴅᴇʟᴇᴛᴇᴅ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        const fileData = data.result;
        const fileName = fileData.fileName || 'Unknown';
        const fileType = fileData.fileType || 'Unknown';
        const fileSize = fileData.size || 'Unknown';
        const fileDate = fileData.date || 'Unknown';
        const dlLink = fileData.dl_link;

        // ❌ No download link
        if (!dlLink) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋ', [
                    '🔴 ᴄᴏᴜʟᴅ ɴᴏᴛ ᴇxᴛʀᴀᴄᴛ ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋ',
                    '💡 ᴛʀʏ ᴀɢᴀɪɴ ᴡɪᴛʜ ᴀ ᴅɪꜰꜰᴇʀᴇɴᴛ ʟɪɴᴋ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ✅ File info card
        await sock.sendMessage(chatId, {
            text: box('📄 ꜰɪʟᴇ ꜰᴏᴜɴᴅ', [
                `📁 ꜰɪʟᴇ : ${fileName}`,
                `📦 ᴛʏᴘᴇ : ${fileType}`,
                `📏 ꜱɪᴢᴇ : ${fileSize}`,
                `📅 ᴅᴀᴛᴇ : ${fileDate}`,
                '⏳ ꜱᴛᴀᴛᴜꜱ : ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...'
            ]),
            ...channelInfo
        }, { quoted: message });

        // ═══════════════════════════════════════
        // 📏 SIZE PARSING
        // ═══════════════════════════════════════
        let fileSizeBytes = 0;
        let sizeInMB = 0;
        let sizeWarning = '';

        try {
            if (fileSize.includes('KB')) {
                const kb = parseFloat(fileSize.replace('KB', '').trim());
                fileSizeBytes = kb * 1024;
            } else if (fileSize.includes('MB')) {
                const mb = parseFloat(fileSize.replace('MB', '').trim());
                fileSizeBytes = mb * 1024 * 1024;
                sizeInMB = mb;
            } else if (fileSize.includes('GB')) {
                const gb = parseFloat(fileSize.replace('GB', '').trim());
                fileSizeBytes = gb * 1024 * 1024 * 1024;
                sizeInMB = gb * 1024;
            }
        } catch (e) {
            console.log('Could not parse file size');
        }

        if (sizeInMB > 100) {
            sizeWarning = `⚠️ ꜰɪʟᴇ ɪꜱ ${fileSize} (ᴍᴀʏ ꜰᴀɪʟ ɪꜰ >100ᴍʙ)`;
        }

        // ═══════════════════════════════════════
        // 📤 SEND FILE
        // ═══════════════════════════════════════
        try {
            await sock.sendMessage(chatId, {
                document: { url: dlLink },
                mimetype: fileType || 'application/octet-stream',
                fileName: fileName,
                caption: box('✅ ᴅᴏᴡɴʟᴏᴀᴅ ᴄᴏᴍᴘʟᴇᴛᴇ', [
                    `📁 ꜰɪʟᴇ : ${fileName}`,
                    `📏 ꜱɪᴢᴇ : ${fileSize}`,
                    '✅ ꜱᴛᴀᴛᴜꜱ : ꜱᴇɴᴛ',
                    ...(sizeWarning ? [sizeWarning] : [])
                ]),
                ...channelInfo
            }, { quoted: message });

            await addReaction(sock, message, '✅');

        } catch (sendError) {
            console.error('Send error:', sendError);

            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('⚠️ ᴄᴀɴɴᴏᴛ ꜱᴇɴᴅ ꜰɪʟᴇ', [
                    `📁 ꜰɪʟᴇ : ${fileName}`,
                    `📏 ꜱɪᴢᴇ : ${fileSize}`,
                    '🔴 ꜱᴛᴀᴛᴜꜱ : ꜰᴀɪʟᴇᴅ ᴛᴏ ꜱᴇɴᴅ ᴠɪᴀ ᴡʜᴀᴛꜱᴀᴘᴘ',
                    '━━━━━━━━━━━━━━━━━━',
                    '📥 мʋʓαмιℓ ᴅᴏᴡɴʟᴏᴀᴅ :',
                    `🔗 ${dlLink}`
                ]),
                ...channelInfo
            }, { quoted: message });
        }

    } catch (error) {
        console.error('MediaFire command error:', error);
        await addReaction(sock, message, '❌');

        let errorMsg = error.message || 'Something went wrong';
        if (error.code === 'ECONNABORTED') {
            errorMsg = 'Request timeout. Try again.';
        } else if (error.response?.status === 404) {
            errorMsg = 'File not found. It may be deleted.';
        } else if (error.response?.status === 429) {
            errorMsg = 'Rate limited. Try again later.';
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

module.exports = mediafireCommand;