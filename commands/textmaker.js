const axios = require('axios');
const mumaker = require('mumaker');

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
//                    🎨 TEXT STYLES MAP
// ═══════════════════════════════════════════════════════════
const TEXT_STYLES = {
    metallic:   { emoji: '⚙️', name: 'Metal 3D',      url: 'https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html' },
    ice:        { emoji: '🧊', name: 'Ice',           url: 'https://en.ephoto360.com/ice-text-effect-online-101.html' },
    snow:       { emoji: '❄️', name: 'Snow 3D',       url: 'https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html' },
    impressive: { emoji: '🎨', name: 'Colorful Paint',url: 'https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html' },
    matrix:     { emoji: '🟢', name: 'Matrix',        url: 'https://en.ephoto360.com/matrix-text-effect-154.html' },
    light:      { emoji: '💡', name: 'Light Futuristic',url: 'https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html' },
    neon:       { emoji: '🌟', name: 'Neon',          url: 'https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html' },
    devil:      { emoji: '😈', name: 'Neon Devil',    url: 'https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html' },
    purple:     { emoji: '💜', name: 'Purple',        url: 'https://en.ephoto360.com/purple-text-effect-online-100.html' },
    thunder:    { emoji: '⚡', name: 'Thunder',       url: 'https://en.ephoto360.com/thunder-text-effect-online-97.html' },
    leaves:     { emoji: '🍃', name: 'Green Brush',   url: 'https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html' },
    '1917':     { emoji: '🎖️', name: '1917 Style',    url: 'https://en.ephoto360.com/1917-style-text-effect-523.html' },
    arena:      { emoji: '⚔️', name: 'Arena of Valor',url: 'https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html' },
    hacker:     { emoji: '👾', name: 'Hacker',        url: 'https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html' },
    sand:       { emoji: '🏖️', name: 'Sand',          url: 'https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html' },
    blackpink:  { emoji: '🖤', name: 'Blackpink',     url: 'https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html' },
    glitch:     { emoji: '📺', name: 'Glitch',        url: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html' },
    fire:       { emoji: '🔥', name: 'Fire Flame',    url: 'https://en.ephoto360.com/flame-lettering-effect-372.html' }
};

// ═══════════════════════════════════════════════════════════
//                    🎨 MAIN COMMAND
// ═══════════════════════════════════════════════════════════
async function textmakerCommand(sock, chatId, message, q, type) {
    try {
        await addReaction(sock, message, '🎨');

        // Extract text
        const text = q ? q.split(' ').slice(1).join(' ').trim() : '';

        // ❌ No text
        if (!text) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🎨 ᴛᴇxᴛ ᴍᴀᴋᴇʀ', [
                    `📌 ᴜꜱᴀɢᴇ : .${type} <text>`,
                    `🔍 ᴇxᴀᴍᴘʟᴇ : .${type} Muzamil`,
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ❌ Invalid type
        const style = TEXT_STYLES[type];
        if (!style) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɪɴᴠᴀʟɪᴅ ꜱᴛʏʟᴇ', [
                    `🔴 ᴜɴᴋɴᴏᴡɴ ᴛʏᴘᴇ : ${type}`,
                    '💡 ᴛʀʏ ᴀ ᴠᴀʟɪᴅ ꜱᴛʏʟᴇ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '🔄');

        // 🎨 Generate image
        const result = await mumaker.ephoto(style.url, text);

        if (!result || !result.image) {
            throw new Error('No image URL received from the API');
        }

        // ✅ Success
        await addReaction(sock, message, '✅');
        await sock.sendMessage(chatId, {
            image: { url: result.image },
            caption: box(`${style.emoji} ${style.name.toUpperCase()}`, [
                `📝 ᴛᴇxᴛ : ${text}`,
                `🎨 ꜱᴛʏʟᴇ : ${style.name}`,
                '✅ ꜱᴛᴀᴛᴜꜱ : ɢᴇɴᴇʀᴀᴛᴇᴅ'
            ]),
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in textmaker command:', error);
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

module.exports = textmakerCommand;