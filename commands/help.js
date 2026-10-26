const settings = require('../settings');
const { getSessionSettings } = require('../lib/session_data');

// ===============================
// 🎯 BOT DP URL
// ===============================
const DEFAULT_BOT_DP_URL = 'https://i.ibb.co/zhBH3mzR/file-000000002ae08211834774ce8bc71642.png';

// ===============================
// 🎯 MENU AUDIO URL
// ===============================
const MENU_AUDIO_URL = 'https://files.catbox.moe/frxb0k.mp3';

// ===============================
// 🎯 CHANNEL INFO (FORWARD ON)
// ===============================
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

async function helpCommand(sock, chatId, message) {
    const sessionSettings = getSessionSettings(sock);

    // 📄 Reaction
    await sock.sendMessage(chatId, {
        react: {
            text: '📄',
            key: message.key
        }
    });

    const helpMessage = 
`*╭┈───〔 ${sessionSettings.botName || '𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫'} 〕┈───⊷*
*├✦ Owner:* ${sessionSettings.ownerName || 'Muzamil'}
*├✦ Owner number:* ${sessionSettings.ownerNumber || ''}
*├✦ Version:* ${settings.version || '3.0.7'}
*├✦ Team™:* ${global.ytch || 'TeamRedXhackers'}
*├✦ Mode:* Public
*╰───────────────────⊷*

\`『 DOWNLOAD 』\`
╭───────────────────⊷
*┋ ⬡ ᴘʟᴀʏ*
*┋ ⬡ sᴏɴɢ*
*┋ ⬡ sᴘᴏᴛɪғʏ*
*┋ ⬡ ɪɴsᴛᴀɢʀᴀᴍ*
*┋ ⬡ ғᴀᴄᴇʙᴏᴏᴋ*
*┋ ⬡ ᴛɪᴋᴛᴏᴋ*
*┋ ⬡ ᴠɪᴅᴇᴏ*
*┋ ⬡ ʏᴛᴍᴘ4*
*┋ ⬡ ʏᴛs*
╰───────────────────⊷
\`『 OWNER 』\`
╭───────────────────⊷
*┋ ⬡ ᴍᴏᴅᴇ*
*┋ ⬡ ʙᴏᴛɴᴀᴍᴇ*
*┋ ⬡ ʙᴏᴛᴅᴘ*
*┋ ⬡ ᴏᴡɴᴇʀɴᴜᴍʙᴇʀ*
*┋ ⬡ ᴏᴡɴᴇʀɴᴀᴍᴇ*
*┋ ⬡ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ*
*┋ ⬡ ᴄʟᴇᴀʀsᴇssɪᴏɴ*
*┋ ⬡ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ*
*┋ ⬡ ᴄʟᴇᴀʀᴛᴍᴘ*
*┋ ⬡ ᴜᴘᴅᴀᴛᴇ*
*┋ ⬡ sᴇᴛᴛɪɴɢs*
*┋ ⬡ sᴇᴛᴘᴘ*
*┋ ⬡ ᴀᴜᴛᴏʀᴇᴀᴄᴛ*
*┋ ⬡ ᴀᴜᴛᴏsᴛᴀᴛᴜs*
*┋ ⬡ ᴀᴜᴛᴏᴛʏᴘɪɴɢ*
*┋ ⬡ ᴀᴜᴛᴏʀᴇᴀᴅ*
*┋ ⬡ ɪɴᴅɪᴄᴀᴛᴏʀ*
*┋ ⬡ sᴇʟғᴄʜᴀᴛ*
*┋ ⬡ ᴀɴᴛɪᴄᴀʟʟ*
*┋ ⬡ ᴘᴍʙʟᴏᴄᴋᴇʀ*
*┋ ⬡ ᴍᴇɴᴛɪᴏɴ*
*┋ ⬡ sᴇᴛᴍᴇɴᴛɪᴏɴ*
*┋ ⬡ sᴜᴅᴏ*
╰───────────────────⊷
\`『 GENERAL 』\`
╭───────────────────⊷
*┋ ⬡ ᴍᴇɴᴜ*
*┋ ⬡ ᴘɪɴɢ*
*┋ ⬡ ᴀʟɪᴠᴇ*
*┋ ⬡ ᴛᴛs*
*┋ ⬡ ᴏᴡɴᴇʀ*
*┋ ⬡ ᴊᴏᴋᴇ*
*┋ ⬡ ǫᴜᴏᴛᴇ*
*┋ ⬡ ғᴀᴄᴛ*
*┋ ⬡ ᴡᴇᴀᴛʜᴇʀ*
*┋ ⬡ ɴᴇᴡs*
*┋ ⬡ ᴀᴛᴛᴘ*
*┋ ⬡ ʟʏʀɪᴄs*
*┋ ⬡ 8ʙᴀʟʟ*
*┋ ⬡ ɢʀᴏᴜᴘɪɴғᴏ*
*┋ ⬡ sᴛᴀғғ*
*┋ ⬡ ᴠᴠ*
*┋ ⬡ ᴛʀᴛ*
*┋ ⬡ ss*
*┋ ⬡ ᴊɪᴅ*
*┋ ⬡ ᴜʀʟ*
╰───────────────────⊷
\`『 ADMIN 』\`
╭───────────────────⊷
*┋ ⬡ ʙᴀɴ*
*┋ ⬡ ᴜɴʙᴀɴ*
*┋ ⬡ ᴘʀᴏᴍᴏᴛᴇ*
*┋ ⬡ ᴅᴇᴍᴏᴛᴇ*
*┋ ⬡ ᴍᴜᴛᴇ*
*┋ ⬡ ᴜɴᴍᴜᴛᴇ*
*┋ ⬡ ᴅᴇʟᴇᴛᴇ*
*┋ ⬡ ᴋɪᴄᴋ*
*┋ ⬡ ᴡᴀʀɴɪɴɢs*
*┋ ⬡ ᴡᴀʀɴ*
*┋ ⬡ ᴀɴᴛɪʟɪɴᴋ*
*┋ ⬡ ᴀɴᴛɪᴛᴀɢ*
*┋ ⬡ ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅ*
*┋ ⬡ ᴄʜᴀᴛʙᴏᴛ*
*┋ ⬡ ᴡᴇʟᴄᴏᴍᴇ*
*┋ ⬡ ɢᴏᴏᴅʙʏᴇ*
*┋ ⬡ ᴄʟᴇᴀʀ*
*┋ ⬡ ᴛᴀɢ*
*┋ ⬡ ᴛᴀɢᴀʟʟ*
*┋ ⬡ ᴛᴀɢɴᴏᴛᴀᴅᴍɪɴ*
*┋ ⬡ ʜɪᴅᴇᴛᴀɢ*
*┋ ⬡ ʀᴇsᴇᴛʟɪɴᴋ*
*┋ ⬡ sᴇᴛɢᴅᴇsᴄ*
*┋ ⬡ sᴇᴛɢɴᴀᴍᴇ*
*┋ ⬡ sᴇᴛɢᴘᴘ*
*┋ ⬡ ɢᴇᴛᴘᴘ*
*┋ ⬡ ɢᴄsᴛᴀᴛᴜs*
*┋ ⬡ ᴀᴅᴅsᴏs*
*┋ ⬡ ᴅᴇʟsᴏs*
╰───────────────────⊷
\`『 SEARCH 』\`
╭───────────────────⊷
*┋ ⬡ ᴛʀᴜᴇᴄᴀʟʟᴇʀ*
*┋ ⬡ sɪᴍᴅᴀᴛᴀ*
*┋ ⬡ ᴀᴘᴋ*
*┋ ⬡ ɢɪᴛʜᴜʙ*
*┋ ⬡ ғᴇᴛᴄʜ*
*┋ ⬡ ғᴇᴛᴄʜᴀᴘɪ*
*┋ ⬡ sᴇᴀʀᴄʜɪᴍɢ*
*┋ ⬡ ᴍᴇᴅɪᴀғɪʀᴇ*
╰───────────────────⊷
\`『 STICKER 』\`
╭───────────────────⊷
*┋ ⬡ sᴛɪᴄᴋᴇʀ*
*┋ ⬡ sɪᴍᴀɢᴇ*
*┋ ⬡ ᴛᴀᴋᴇ*
*┋ ⬡ ᴇᴍᴏᴊɪᴍɪx*
*┋ ⬡ ᴛɢsᴛɪᴄᴋᴇʀ*
*┋ ⬡ ᴄʀᴏᴘ*
*┋ ⬡ ʙʟᴜʀ*
*┋ ⬡ ʀᴇᴍᴏᴠᴇʙɢ*
*┋ ⬡ ʀᴇᴍɪɴɪ*
*┋ ⬡ ᴍᴇᴍᴇ*
*┋ ⬡ ɪɢs*
*┋ ⬡ ɪɢsᴄ*
╰───────────────────⊷
\`『 AI 』\`
╭───────────────────⊷
*┋ ⬡ ɢᴘᴛ*
*┋ ⬡ ɢᴇᴍɪɴɪ*
*┋ ⬡ ɪᴍᴀɢɪɴᴇ*
*┋ ⬡ ғʟᴜx*
*┋ ⬡ sᴏʀᴀ*
╰───────────────────⊷
\`『 FUN 』\`
╭───────────────────⊷
*┋ ⬡ ᴄᴏᴍᴘʟɪᴍᴇɴᴛ*
*┋ ⬡ ɪɴsᴜʟᴛ*
*┋ ⬡ ғʟɪʀᴛ*
*┋ ⬡ sʜᴀʏᴀʀɪ*
*┋ ⬡ ɢᴏᴏᴅɴɪɢʜᴛ*
*┋ ⬡ ʀᴏsᴇᴅᴀʏ*
*┋ ⬡ ᴄʜᴀʀᴀᴄᴛᴇʀ*
*┋ ⬡ ᴡᴀsᴛᴇᴅ*
*┋ ⬡ sʜɪᴘ*
*┋ ⬡ sɪᴍᴘ*
*┋ ⬡ sᴛᴜᴘɪᴅ*
╰───────────────────⊷
\`『 TEXTMAKER 』\`
╭───────────────────⊷
*┋ ⬡ ᴍᴇᴛᴀʟʟɪᴄ*
*┋ ⬡ ɪᴄᴇ*
*┋ ⬡ sɴᴏᴡ*
*┋ ⬡ ɪᴍᴘʀᴇssɪᴠᴇ*
*┋ ⬡ ᴍᴀᴛʀɪx*
*┋ ⬡ ʟɪɢʜᴛ*
*┋ ⬡ ɴᴇᴏɴ*
*┋ ⬡ ᴅᴇᴠɪʟ*
*┋ ⬡ ᴘᴜʀᴘʟᴇ*
*┋ ⬡ ᴛʜᴜɴᴅᴇʀ*
*┋ ⬡ ʟᴇᴀᴠᴇs*
*┋ ⬡ 1917*
*┋ ⬡ ᴀʀᴇɴᴀ*
*┋ ⬡ ʜᴀᴄᴋᴇʀ*
*┋ ⬡ sᴀɴᴅ*
*┋ ⬡ ʙʟᴀᴄᴋᴘɪɴᴋ*
*┋ ⬡ ɢʟɪᴛᴄʜ*
*┋ ⬡ ғɪʀᴇ*
╰───────────────────⊷
\`『 MISC 』\`
╭───────────────────⊷
*┋ ⬡ ʜᴇᴀʀᴛ*
*┋ ⬡ ʜᴏʀɴʏ*
*┋ ⬡ ᴄɪʀᴄʟᴇ*
*┋ ⬡ ʟɢʙᴛ*
*┋ ⬡ ʟᴏʟɪᴄᴇ*
*┋ ⬡ ɪᴛs-sᴏ-sᴛᴜᴘɪᴅ*
*┋ ⬡ ɴᴀᴍᴇᴄᴀʀᴅ*
*┋ ⬡ ᴏᴏɢᴡᴀʏ*
*┋ ⬡ ᴛᴡᴇᴇᴛ*
*┋ ⬡ ʏᴛᴄᴏᴍᴍᴇɴᴛ*
*┋ ⬡ ᴄᴏᴍʀᴀᴅᴇ*
*┋ ⬡ ɢᴀʏ*
*┋ ⬡ ɢʟᴀss*
*┋ ⬡ ᴊᴀɪʟ*
*┋ ⬡ ᴘᴀssᴇᴅ*
*┋ ⬡ ᴛʀɪɢɢᴇʀᴇᴅ*
╰───────────────────⊷
\`『 ANIME 』\`
╭───────────────────⊷
*┋ ⬡ ɴᴏᴍ*
*┋ ⬡ ᴘᴏᴋᴇ*
*┋ ⬡ ᴄʀʏ*
*┋ ⬡ ᴋɪss*
*┋ ⬡ ᴘᴀᴛ*
*┋ ⬡ ʜᴜɢ*
*┋ ⬡ ᴡɪɴᴋ*
*┋ ⬡ ғᴀᴄᴇᴘᴀʟᴍ*
╰───────────────────⊷
\`『 GITHUB 』\`
╭───────────────────⊷
*┋ ⬡ ɢɪᴛ*
*┋ ⬡ ɢɪᴛʜᴜʙ*
*┋ ⬡ sᴄ*
*┋ ⬡ sᴄʀɪᴘᴛ*
*┋ ⬡ ʀᴇᴘᴏ*
╰───────────────────⊷

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${sessionSettings.botName || '𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫'}*`;

    try {
        // ✅ 1st message: DP + Menu (caption)
        await sock.sendMessage(chatId, {
            image: { url: sessionSettings.botDp || DEFAULT_BOT_DP_URL },
            caption: helpMessage,
            ...channelInfo
        }, { quoted: message });

        // ✅ 2nd message: MP3 audio
        await sock.sendMessage(chatId, {
            audio: { url: MENU_AUDIO_URL },
            mimetype: 'audio/mpeg',
            ptt: false,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error sending menu (image/audio):', error);

        // ✅ Fallback: text only + try audio again
        try {
            await sock.sendMessage(chatId, {
                text: helpMessage,
                ...channelInfo
            }, { quoted: message });

            await sock.sendMessage(chatId, {
                audio: { url: MENU_AUDIO_URL },
                mimetype: 'audio/mpeg',
                ptt: false,
                ...channelInfo
            }, { quoted: message });
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            try {
                await sock.sendMessage(chatId, { text: helpMessage }, { quoted: message });
            } catch (lastError) {
                console.error('Last resort failed:', lastError);
            }
        }
    }
}

module.exports = helpCommand;
