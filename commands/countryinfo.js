const axios = require('axios');

// ═══════════════════════════════════════════════════════════
//                    🎯 CHANNEL INFO
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
//                    🚫 BLOCKED COUNTRIES
// ═══════════════════════════════════════════════════════════
const BLOCKED_COUNTRIES = [
    'israel',
    'israeli',
    'il',
    'palestine-israel',
    'zionist',
    'zionism',
    'tel aviv',
    'jerusalem-israel'
];

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
//                    🚫 CHECK BLOCKED
// ═══════════════════════════════════════════════════════════
function isBlockedCountry(query) {
    const q = String(query || '').toLowerCase().trim();
    return BLOCKED_COUNTRIES.some(blocked => q.includes(blocked));
}

// ═══════════════════════════════════════════════════════════
//                    🌍 MAIN COMMAND
// ═══════════════════════════════════════════════════════════
async function countryinfoCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🌍');

        const text = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text || '';
        
        const query = text.replace(/^\.(?:countryinfo|cinfo|country|cinfo2)\b/i, '').trim();

        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🌍 ᴄᴏᴜɴᴛʀʏ ɪɴꜰᴏ', [
                    '📌 ᴜꜱᴀɢᴇ : .ᴄᴏᴜɴᴛʀʏɪɴꜰᴏ [ᴄᴏᴜɴᴛʀʏ]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .ᴄᴏᴜɴᴛʀʏɪɴꜰᴏ ᴘᴀᴋɪꜱᴛᴀɴ',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴛʀʏ : ᴘᴀᴋɪꜱᴛᴀɴ, ɪɴᴅɪᴀ, ᴜꜱᴀ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ═══════════════════════════════════════
        // 🚫 ISRAEL BLOCK CHECK
        // ═══════════════════════════════════════
        if (isBlockedCountry(query)) {
            await addReaction(sock, message, '🚫');
            
            const blockedText = 
`╭━━━━━━━━━━━━━━━━━━╮
┃  ✦ 🚫 ʙʟᴏᴄᴋᴇᴅ
╰━━━━━━━━━━━━━━━━━━╯

▸ ⚠️ *ISRAEL IS NOT A COUNTRY!*
▸ ━━━━━━━━━━━━━━━━━━
▸ 🇵🇸 ɴᴏᴛ ᴀ ʀᴇᴄᴏɢɴɪᴢᴇᴅ ᴄᴏᴜɴᴛʀʏ
▸ ❌ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ɴᴏᴛ ᴀᴠᴀɪʟᴀʙʟᴇ
▸ ━━━━━━━━━━━━━━━━━━
▸ 🕊️ *FREE PALESTINE* 🇵🇸
▸ ✊ ʟᴏɴɢ ʟɪᴠᴇ ᴘᴀʟᴇꜱᴛɪɴᴇ

━━━━━━━━━━━━━━━━━━━━
   👑 𝗕𝘆 : 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫`;

            return await sock.sendMessage(chatId, {
                text: blockedText,
                ...channelInfo
            }, { quoted: message });
        }

        // 🔍 Processing
        await addReaction(sock, message, '🔍');

        const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl, {
            timeout: 30000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (!data.status || !data.data) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏ ɪɴꜰᴏ', [
                    `🔴 ɴᴏ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ꜰᴏʀ : ${query}`,
                    '💡 ᴘʟᴇᴀꜱᴇ ᴄʜᴇᴄᴋ ᴛʜᴇ ᴄᴏᴜɴᴛʀʏ ɴᴀᴍᴇ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        const info = data.data;

        // ✅ Double check - agar API ne Israel bheja toh bhi block
        if (info.name && isBlockedCountry(info.name)) {
            await addReaction(sock, message, '🚫');
            return await sock.sendMessage(chatId, {
                text: 
`╭━━━━━━━━━━━━━━━━━━╮
┃  ✦ 🚫 ʙʟᴏᴄᴋᴇᴅ
╰━━━━━━━━━━━━━━━━━━╯

▸ ⚠️ *ISRAEL IS NOT A COUNTRY!*
▸ ❌ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ɴᴏᴛ ᴀᴠᴀɪʟᴀʙʟᴇ
▸ 🕊️ *FREE PALESTINE* 🇵🇸

━━━━━━━━━━━━━━━━━━━━
   👑 𝗕𝘆 : 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫`,
                ...channelInfo
            }, { quoted: message });
        }

        const neighborsText = info.neighbors && info.neighbors.length > 0
            ? info.neighbors.map(n => `🌍 ${n.name}`).join(', ')
            : 'No neighbors';

        // 🎨 VIP Design
        const countryText = box(`🌍 ᴄᴏᴜɴᴛʀʏ ɪɴꜰᴏ`, [
            `📌 ɴᴀᴍᴇ : ${info.name}`,
            `🏛️ ᴄᴀᴘɪᴛᴀʟ : ${info.capital}`,
            `📍 ᴄᴏɴᴛɪɴᴇɴᴛ : ${info.continent.name} ${info.continent.emoji}`,
            `📞 ᴘʜᴏɴᴇ ᴄᴏᴅᴇ : +${info.phoneCode}`,
            `📏 ᴀʀᴇᴀ : ${info.area.squareKilometers} km²`,
            `🚗 ᴅʀɪᴠɪɴɢ ꜱɪᴅᴇ : ${info.drivingSide}`,
            `💱 ᴄᴜʀʀᴇɴᴄʏ : ${info.currency}`,
            `🔤 ʟᴀɴɢᴜᴀɢᴇꜱ : ${info.languages.native.join(', ')}`,
            `🌟 ꜰᴀᴍᴏᴜꜱ ꜰᴏʀ : ${trim(info.famousFor, 50)}`,
            `🌍 ɪꜱᴏ ᴄᴏᴅᴇꜱ : ${info.isoCode.alpha2.toUpperCase()}, ${info.isoCode.alpha3.toUpperCase()}`,
            `🌐 ᴛʟᴅ : ${info.internetTLD}`,
            `━━━━━━━━━━━━━━━━━━`,
            `🔗 ɴᴇɪɢʜʙᴏʀꜱ : ${neighborsText}`
        ]);

        await addReaction(sock, message, '✅');

        await sock.sendMessage(chatId, {
            image: { url: info.flag },
            caption: countryText,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Countryinfo error:', error);
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

module.exports = countryinfoCommand;