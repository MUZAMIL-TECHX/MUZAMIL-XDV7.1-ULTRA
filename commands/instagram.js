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

const processedMessages = new Set();

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
//                    🚀 MAIN COMMAND
// ═══════════════════════════════════════════════════════════
async function instagramCommand(sock, chatId, message) {
    try {
        if (processedMessages.has(message.key.id)) return;
        processedMessages.add(message.key.id);
        setTimeout(() => processedMessages.delete(message.key.id), 5 * 60 * 1000);

        await addReaction(sock, message, '📸');

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const url = text?.split(' ').slice(1).join(' ').trim();

        // ❌ No URL
        if (!url) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('📸 ɪɴꜱᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ', [
                    '📌 ᴜꜱᴀɢᴇ : .instagram [link]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .instagram https://www.instagram.com/p/xxxxx',
                    '━━━━━━━━━━━━━━━━━━',
                    '✅ ꜱᴜᴘᴘᴏʀᴛᴇᴅ ꜰᴏʀᴍᴀᴛꜱ :',
                    '• instagram.com/p/xxxxx',
                    '• instagram.com/reel/xxxxx',
                    '• instagram.com/tv/xxxxx'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        const instagramPatterns = [
            /https?:\/\/(?:www\.)?instagram\.com\//,
            /https?:\/\/(?:www\.)?instagr\.am\//,
            /https?:\/\/(?:www\.)?instagram\.com\/p\//,
            /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
            /https?:\/\/(?:www\.)?instagram\.com\/tv\//
        ];

        // ❌ Invalid link
        if (!instagramPatterns.some(p => p.test(url))) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɪɴᴠᴀʟɪᴅ ʟɪɴᴋ', [
                    '🔴 ᴘʟᴇᴀꜱᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ɪɴꜱᴛᴀɢʀᴀᴍ ʟɪɴᴋ',
                    '━━━━━━━━━━━━━━━━━━',
                    '✅ ꜱᴜᴘᴘᴏʀᴛᴇᴅ ꜰᴏʀᴍᴀᴛꜱ :',
                    '• instagram.com/p/xxxxx',
                    '• instagram.com/reel/xxxxx',
                    '• instagram.com/tv/xxxxx'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '🔄');

        // ✅ NEW API - Aswin Sparky
        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
        console.log(`[INSTAGRAM] Requesting: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
            timeout: 30000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const data = response.data;

        // ❌ No media
        if (!data.status || !data.data || data.data.length === 0) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ᴍᴇᴅɪᴀ ꜰᴏᴜɴᴅ', [
                    '🔴 ᴘᴏꜱᴛ ᴍɪɢʜᴛ ʙᴇ ᴘʀɪᴠᴀᴛᴇ ᴏʀ ɪɴᴠᴀʟɪᴅ',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴛʀʏ :',
                    '• ᴄʜᴇᴄᴋ ɪꜰ ᴘᴏꜱᴛ ɪꜱ ᴘᴜʙʟɪᴄ',
                    '• ᴛʀʏ ᴀ ᴅɪꜰꜰᴇʀᴇɴᴛ ʟɪɴᴋ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        const mediaData = data.data;
        const mediaToDownload = mediaData.slice(0, 20);

        // ⏳ Downloading status
        await sock.sendMessage(chatId, {
            text: box('📥 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ', [
                `📊 ᴛᴏᴛᴀʟ : ${mediaToDownload.length} ᴍᴇᴅɪᴀ(ꜱ) ꜰᴏᴜɴᴅ`,
                '⏳ ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ...'
            ]),
            ...channelInfo
        }, { quoted: message });

        // ═══════════════════════════════════════
        // 📥 DOWNLOAD ALL MEDIA
        // ═══════════════════════════════════════
        for (let i = 0; i < mediaToDownload.length; i++) {
            try {
                const media = mediaToDownload[i];
                const mediaUrl = media.url;

                const isVideo = media.type === 'video' ||
                              url.includes('/reel/') ||
                              url.includes('/tv/');

                if (isVideo) {
                    await sock.sendMessage(chatId, {
                        video: { url: mediaUrl },
                        mimetype: "video/mp4",
                        caption: box('📹 ᴠɪᴅᴇᴏ', [
                            `📊 ᴍᴇᴅɪᴀ : ${i + 1} / ${mediaToDownload.length}`,
                            '✅ ꜱᴛᴀᴛᴜꜱ : ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        image: { url: mediaUrl },
                        caption: box('📸 ɪᴍᴀɢᴇ', [
                            `📊 ᴍᴇᴅɪᴀ : ${i + 1} / ${mediaToDownload.length}`,
                            '✅ ꜱᴛᴀᴛᴜꜱ : ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                }

                if (i < mediaToDownload.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

            } catch (mediaError) {
                console.error(`Error downloading media ${i + 1}:`, mediaError);
            }
        }

        await addReaction(sock, message, '✅');

    } catch (error) {
        console.error('Instagram command error:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [
                `🔴 ${error.message || 'Something went wrong'}`,
                '💡 ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = instagramCommand;
