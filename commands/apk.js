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
//                    💎 VIP DESIGN FRAME (CLEAN)
// ═══════════════════════════════════════════════════════════
function vipBox(title, lines = []) {
    let out = `╭━━━━━━━━━━━━━━━╮\n`;
    out += `   ✦ ${title} ✦\n`;
    out += `╰━━━━━━━━━━━━━━━╯\n`;
    for (const l of lines) out += `▸ ${l}\n`;
    out += `━━━━━━━━━━━━━━━━\n`;
    out += `👑 𝗕𝘆 : 𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫`;
    return out;
}

// ═══════════════════════════════════════════════════════════
//                    📱 MAIN COMMAND
// ═══════════════════════════════════════════════════════════
async function apkCommand(sock, chatId, message, query) {
    try {
        await addReaction(sock, message, '📱');

        // ❌ No query
        if (!query) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: vipBox('📱 𝙰𝙿𝙺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁', [
                    '📌 𝚄𝚜𝚊𝚐𝚎 : .apk <app name>',
                    '🔍 𝙴𝚡𝚊𝚖𝚙𝚕𝚎𝚜 :',
                    '• .apk whatsapp',
                    '• .apk facebook',
                    '• .apk instagram'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await addReaction(sock, message, '🔄');
        await sock.sendPresenceUpdate('composing', chatId);

        const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(query)}/limit=1`;

        console.log(`[APK] Searching: ${query}`);

        const response = await axios.get(apiUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        const data = response.data;

        // ❌ Not found
        if (!data || !data.datalist || !data.datalist.list || data.datalist.list.length === 0) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: vipBox('❌ 𝙰𝙿𝙺 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳', [
                    `🔍 𝚀𝚞𝚎𝚛𝚢 : ${query}`,
                    '💡 𝚃𝚛𝚢 :',
                    '• Check spelling',
                    '• Use shorter name'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const app = data.datalist.list[0];
        const appSize = (app.size / 1048576).toFixed(2);
        const appName = app.name || query;
        const appPackage = app.package || 'Unknown';
        const appVersion = app.file?.vername || 'Unknown';
        const appIcon = app.icon || '';
        const appPath = app.file?.path || app.file?.path_alt;

        if (!appPath) {
            throw new Error('Download link not available');
        }

        let downloadUrl = appPath;
        if (!downloadUrl.startsWith('http')) {
            downloadUrl = `https://ws75.aptoide.com${downloadUrl}`;
        }

        // ═══════════════════════════════════════
        // LARGE FILE (> 95MB) — Send link only
        // ═══════════════════════════════════════
        if (parseFloat(appSize) > 95) {
            const largeCaption = vipBox('📱 𝙰𝙿𝙺 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽', [
                `👑 𝙽𝚊𝚖𝚎 : ${appName.toUpperCase()}`,
                `📦 𝙿𝚊𝚌𝚔𝚊𝚐𝚎 : ${appPackage.toUpperCase()}`,
                `📏 𝚂𝚒𝚣𝚎 : ${appSize} MB`,
                `🔄 𝚅𝚎𝚛𝚜𝚒𝚘𝚗 : ${appVersion}`,
                '━━━━━━━━━━━━━━━━',
                '⚠️ 𝙵𝚒𝚕𝚎 𝚝𝚘𝚘 𝚕𝚊𝚛𝚐𝚎 𝚏𝚘𝚛 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿',
                '📥 𝚄𝚜𝚎 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚕𝚒𝚗𝚔 𝚋𝚎𝚕𝚘𝚠',
                `🔗 ${downloadUrl}`
            ]);

            if (appIcon) {
                try {
                    await sock.sendMessage(chatId, {
                        image: { url: appIcon },
                        caption: largeCaption,
                        ...channelInfo
                    }, { quoted: message });
                } catch (imgError) {
                    await sock.sendMessage(chatId, {
                        text: largeCaption,
                        ...channelInfo
                    }, { quoted: message });
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: largeCaption,
                    ...channelInfo
                }, { quoted: message });
            }
            await addReaction(sock, message, '⚠️');
            return;
        }

        // ═══════════════════════════════════════
        // SMALL FILE — Send directly
        // ═══════════════════════════════════════
        const caption = vipBox('📱 𝙰𝙿𝙺 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽', [
            `👑 𝙽𝚊𝚖𝚎 : ${appName.toUpperCase()}`,
            `📦 𝙿𝚊𝚌𝚔𝚊𝚐𝚎 : ${appPackage.toUpperCase()}`,
            `📏 𝚂𝚒𝚣𝚎 : ${appSize} MB`,
            `🔄 𝚅𝚎𝚛𝚜𝚒𝚘𝚗 : ${appVersion}`,
            '━━━━━━━━━━━━━━━━',
            '⏳ 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚒𝚗𝚐...',
            '📥 𝙿𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝'
        ]);

        if (appIcon) {
            try {
                await sock.sendMessage(chatId, {
                    image: { url: appIcon },
                    caption,
                    ...channelInfo
                }, { quoted: message });
            } catch (imgError) {
                await sock.sendMessage(chatId, {
                    text: caption,
                    ...channelInfo
                }, { quoted: message });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: caption,
                ...channelInfo
            }, { quoted: message });
        }

        // 📥 Send APK file
        await sock.sendMessage(chatId, {
            document: { url: downloadUrl },
            mimetype: "application/vnd.android.package-archive",
            fileName: `${appName}.apk`,
            caption: vipBox('✅ 𝙰𝙿𝙺 𝚁𝙴𝙰𝙳𝚈', [
                `📱 𝙰𝚙𝚙 : ${appName}`,
                `📏 𝚂𝚒𝚣𝚎 : ${appSize} MB`,
                '✅ 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝙲𝚘𝚖𝚙𝚕𝚎𝚝𝚎'
            ]),
            ...channelInfo
        }, { quoted: message });

        await addReaction(sock, message, '✅');
        console.log(`[APK] Successfully sent: ${appName}`);

    } catch (error) {
        console.error('[APK] Error:', error.message);
        await addReaction(sock, message, '❌');

        let errorMsg = error.message || 'Something went wrong';
        if (errorMsg.length > 60) errorMsg = errorMsg.substring(0, 60) + '...';

        await sock.sendMessage(chatId, {
            text: vipBox('❌ 𝙴𝚁𝚁𝙾𝚁', [
                `🔴 ${errorMsg}`,
                '💡 Please try again later'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = apkCommand;