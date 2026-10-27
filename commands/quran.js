const axios = require('axios');
const { translate } = require('@vitalets/google-translate-api');

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
//                    🕋 SURAH NAME → NUMBER MAP (114 Surahs)
// ═══════════════════════════════════════════════════════════
const SURAH_MAP = {
    // 1-10
    'fatiha': 1, 'fatihah': 1, 'al-fatiha': 1, 'al-fatihah': 1,
    'baqarah': 2, 'baqara': 2, 'al-baqarah': 2, 'baqra': 2,
    'imran': 3, 'aali-imran': 3, 'al-imran': 3,
    'nisa': 4, 'an-nisa': 4,
    'maidah': 5, 'al-maidah': 5, 'maida': 5,
    'anam': 6, 'al-anam': 6,
    'araf': 7, 'al-araf': 7,
    'anfal': 8, 'al-anfal': 8,
    'tawbah': 9, 'at-tawbah': 9, 'tauba': 9, 'tawba': 9,
    'yunus': 10,
    // 11-20
    'hud': 11,
    'yusuf': 12,
    'rad': 13, 'ar-rad': 13,
    'ibrahim': 14,
    'hijr': 15, 'al-hijr': 15,
    'nahl': 16, 'an-nahl': 16,
    'isra': 17, 'al-isra': 17,
    'kahf': 18, 'al-kahf': 18, 'kahaf': 18,
    'maryam': 19,
    'taha': 20, 'ta-ha': 20, 'tahaa': 20,
    // 21-30
    'anbiya': 21, 'al-anbiya': 21,
    'hajj': 22, 'al-hajj': 22,
    'muminun': 23, 'al-muminun': 23, 'muminoon': 23,
    'nur': 24, 'an-nur': 24,
    'furqan': 25, 'al-furqan': 25,
    'shuara': 26, 'ash-shuara': 26,
    'naml': 27, 'an-naml': 27,
    'qasas': 28, 'al-qasas': 28,
    'ankabut': 29, 'al-ankabut': 29,
    'rum': 30, 'ar-rum': 30,
    // 31-40
    'luqman': 31,
    'sajda': 32, 'as-sajda': 32,
    'ahzab': 33, 'al-ahzab': 33,
    'saba': 34,
    'fatir': 35,
    'yasin': 36, 'ya-sin': 36, 'yaseen': 36,
    'saffat': 37, 'as-saffat': 37,
    'sad': 38,
    'zumar': 39, 'az-zumar': 39,
    'ghafir': 40, 'mumin': 40,
    // 41-50
    'fussilat': 41,
    'shura': 42, 'ash-shura': 42,
    'zukhruf': 43, 'az-zukhruf': 43,
    'dukhan': 44, 'ad-dukhan': 44,
    'jathiyah': 45, 'al-jathiyah': 45,
    'ahqaf': 46, 'al-ahqaf': 46,
    'muhammad': 47,
    'fath': 48, 'al-fath': 48,
    'hujurat': 49, 'al-hujurat': 49,
    'qaf': 50,
    // 51-60
    'dhariyat': 51, 'adh-dhariyat': 51,
    'tur': 52, 'at-tur': 52,
    'najm': 53, 'an-najm': 53,
    'qamar': 54, 'al-qamar': 54,
    'rahman': 55, 'ar-rahman': 55, 'rehman': 55,
    'waqia': 56, 'al-waqia': 56,
    'hadid': 57, 'al-hadid': 57,
    'mujadila': 58, 'al-mujadila': 58,
    'hashr': 59, 'al-hashr': 59,
    'mumtahanah': 60, 'al-mumtahanah': 60,
    // 61-70
    'saff': 61, 'as-saff': 61,
    'jumuah': 62, 'al-jumuah': 62, 'juma': 62,
    'munafiqun': 63, 'al-munafiqun': 63,
    'taghabun': 64, 'at-taghabun': 64,
    'talaq': 65, 'at-talaq': 65,
    'tahrim': 66, 'at-tahrim': 66,
    'mulk': 67, 'al-mulk': 67,
    'qalam': 68, 'al-qalam': 68,
    'haqqah': 69, 'al-haqqah': 69,
    'maarij': 70, 'al-maarij': 70,
    // 71-80
    'nuh': 71,
    'jinn': 72, 'al-jinn': 72,
    'muzzammil': 73, 'al-muzzammil': 73,
    'muddathir': 74, 'al-muddathir': 74,
    'qiyamah': 75, 'al-qiyamah': 75,
    'insan': 76, 'al-insan': 76,
    'mursalat': 77, 'al-mursalat': 77,
    'naba': 78, 'an-naba': 78,
    'naziat': 79, 'an-naziat': 79,
    'abasa': 80,
    // 81-90
    'takwir': 81, 'at-takwir': 81,
    'infitar': 82, 'al-infitar': 82,
    'mutaffifin': 83, 'al-mutaffifin': 83,
    'inshiqaq': 84, 'al-inshiqaq': 84,
    'buruj': 85, 'al-buruj': 85,
    'tariq': 86, 'at-tariq': 86,
    'ala': 87, 'al-ala': 87,
    'ghashiyah': 88, 'al-ghashiyah': 88,
    'fajr': 89, 'al-fajr': 89,
    'balad': 90, 'al-balad': 90,
    // 91-100
    'shams': 91, 'ash-shams': 91,
    'layl': 92, 'al-layl': 92,
    'duha': 93, 'ad-duha': 93,
    'sharh': 94, 'ash-sharh': 94, 'inshirah': 94,
    'tin': 95, 'at-tin': 95,
    'alaq': 96, 'al-alaq': 96,
    'qadr': 97, 'al-qadr': 97,
    'bayyinah': 98, 'al-bayyinah': 98,
    'zalzalah': 99, 'az-zalzalah': 99,
    'adiyat': 100, 'al-adiyat': 100,
    // 101-110
    'qariah': 101, 'al-qariah': 101,
    'takathur': 102, 'at-takathur': 102, 'takasur': 102,
    'asr': 103, 'al-asr': 103,
    'humazah': 104, 'al-humazah': 104,
    'fil': 105, 'al-fil': 105,
    'quraysh': 106, 'quraish': 106,
    'maun': 107, 'al-maun': 107,
    'kawthar': 108, 'al-kawthar': 108, 'kausar': 108,
    'kafirun': 109, 'al-kafirun': 109,
    'nasr': 110, 'an-nasr': 110,
    // 111-114
    'lahab': 111, 'al-lahab': 111,
    'ikhlas': 112, 'al-ikhlas': 112, 'ikhlaas': 112,
    'falaq': 113, 'al-falaq': 113,
    'nas': 114, 'an-nas': 114
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
//                    🕋 MAIN QURAN COMMAND
// ═══════════════════════════════════════════════════════════
async function quranCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🤍');

        const text = message.message?.conversation ||
                     message.message?.extendedTextMessage?.text || '';

        // Extract query (command remove karo)
        const query = text
            .replace(/^\.(?:quran|surah|fatiha|fatihah|baqarah|baqara|imran|nisa|maidah|maida|anam|araf|anfal|tawbah|tauba|yunus|hud|yusuf|rad|ibrahim|hijr|nahl|isra|kahf|maryam|taha|anbiya|hajj|muminun|nur|furqan|shuara|naml|qasas|ankabut|rum|luqman|sajda|ahzab|saba|fatir|yasin|yaseen|saffat|sad|zumar|ghafir|fussilat|shura|zukhruf|dukhan|jathiyah|ahqaf|muhammad|fath|hujurat|qaf|dhariyat|tur|najm|qamar|rahman|rehman|waqia|hadid|mujadila|hashr|mumtahanah|saff|jumuah|juma|munafiqun|taghabun|talaq|tahrim|mulk|qalam|haqqah|maarij|nuh|jinn|muzzammil|muddathir|qiyamah|insan|mursalat|naba|naziat|abasa|takwir|infitar|mutaffifin|inshiqaq|buruj|tariq|ala|ghashiyah|fajr|balad|shams|layl|duha|sharh|inshirah|tin|alaq|qadr|bayyinah|zalzalah|adiyat|qariah|takathur|takasur|asr|humazah|fil|quraysh|quraish|maun|kawthar|kausar|kafirun|nasr|lahab|ikhlas|ikhlaas|falaq|nas)\b/i, '')
            .trim()
            .toLowerCase();

        if (!query) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🕋 ǫᴜʀᴀɴ ᴄᴏᴍᴍᴀɴᴅ', [
                    '📌 ᴜsᴀɢᴇ : .sᴜʀᴀʜ [1-114]',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .sᴜʀᴀʜ 1',
                    '🔍 ᴇxᴀᴍᴘʟᴇ : .sᴜʀᴀʜ 114',
                    '🔍 ᴏʀ ɴᴀᴍᴇ : .ʏᴀꜱɪɴ',
                    '🔍 ᴏʀ ɴᴀᴍᴇ : .ʀᴀʜᴍᴀɴ',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 114 sᴜʀᴀʜꜱ ᴀᴠᴀɪʟᴀʙʟᴇ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // Convert query to surah number
        let surahNumber = null;

        if (/^\d+$/.test(query)) {
            surahNumber = parseInt(query);
        } else {
            const cleanQuery = query.replace(/['\s-]/g, '');
            surahNumber = SURAH_MAP[cleanQuery] || SURAH_MAP[query];
        }

        if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɴᴏᴛ ꜰᴏᴜɴᴅ', [
                    `🔴 ᴄᴏᴜʟᴅ ɴᴏᴛ ꜰɪɴᴅ : ${query}`,
                    '💡 ᴛʀʏ ɴᴜᴍʙᴇʀ (1-114)',
                    '💡 ᴏʀ ɴᴀᴍᴇ (ʏᴀꜱɪɴ, ʀᴀʜᴍᴀɴ)'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '🔍');

        // Fetch surah
        const res = await axios.get(`https://quran-endpoint.vercel.app/quran/${surahNumber}`, {
            timeout: 30000
        });

        if (res.status !== 200 || !res.data.data) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ᴀᴘɪ ᴇʀʀᴏʀ', ['🔴 ᴄᴏᴜʟᴅ ɴᴏᴛ ꜰᴇᴛᴄʜ sᴜʀᴀʜ']),
                ...channelInfo
            }, { quoted: message });
        }

        const json = res.data;

        // Translate Tafsir
        let translatedTafsirUrdu, translatedTafsirEnglish;
        try {
            translatedTafsirUrdu = await translate(json.data.tafsir.id, { to: 'ur', autoCorrect: true });
            translatedTafsirEnglish = await translate(json.data.tafsir.id, { to: 'en', autoCorrect: true });
        } catch (transError) {
            translatedTafsirUrdu = { text: 'Translation not available' };
            translatedTafsirEnglish = { text: 'Translation not available' };
        }

        const quranSurah = box(`🕋 sᴜʀᴀʜ ${json.data.number}`, [
            `📖 ɴᴀᴍᴇ (ᴀʀ) : ${json.data.asma.ar.long}`,
            `📖 ɴᴀᴍᴇ (ᴇɴ) : ${json.data.asma.en.long}`,
            `💫 ᴛʏᴘᴇ : ${json.data.type.en}`,
            `✅ ᴠᴇʀsᴇs : ${json.data.ayahCount}`,
            '━━━━━━━━━━━━━━━━━━',
            `⚡ ᴜʀᴅᴜ ᴛᴀꜰꜱɪʀ :`,
            `${translatedTafsirUrdu.text?.substring(0, 350) || 'N/A'}...`,
            '━━━━━━━━━━━━━━━━━━',
            `⚡ ᴇɴɢʟɪsʜ ᴛᴀꜰꜱɪʀ :`,
            `${translatedTafsirEnglish.text?.substring(0, 350) || 'N/A'}...`
        ]);

        await addReaction(sock, message, '✅');

        await sock.sendMessage(chatId, {
            image: { url: 'https://i.ibb.co/zhBH3mzR/file-000000002ae08211834774ce8bc71642.png' },
            caption: quranSurah,
            ...channelInfo
        }, { quoted: message });

        // Send audio recitation
        if (json.data.recitation.full) {
            try {
                await sock.sendMessage(chatId, {
                    audio: { url: json.data.recitation.full },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    ...channelInfo
                }, { quoted: message });
            } catch (audioError) {
                console.error('Audio error:', audioError.message);
            }
        }

    } catch (error) {
        console.error('Quran error:', error);
        await addReaction(sock, message, '❌');

        let errorMsg = error.message || 'Unknown error';
        if (errorMsg.length > 80) errorMsg = errorMsg.substring(0, 80) + '...';

        await sock.sendMessage(chatId, {
            text: box('❌ ᴇʀʀᴏʀ', [
                `🔴 ${errorMsg}`,
                '💡 ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = quranCommand;
module.exports.SURAH_MAP = SURAH_MAP;