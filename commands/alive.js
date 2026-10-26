const settings = require("../settings");
const { getSessionSettings } = require('../lib/session_data');

async function aliveCommand(sock, chatId, message) {
    try {
        const sessionSettings = getSessionSettings(sock);
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const message1 =
`╭━━━━━━━━━━━━━━━╮
   ⚡ 𝗕𝗢𝗧 𝗜𝗦 𝗔𝗟𝗜𝗩𝗘 ⚡
╰━━━━━━━━━━━━━━━╯

▸ 🤖 𝗡𝗮𝗺𝗲   : ${sessionSettings.botName}
▸ 👤 𝗢𝘄𝗻𝗲𝗿 : ${sessionSettings.ownerName}
▸ 📦 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : ${settings.version}
▸ 🟢 𝗦𝘁𝗮𝘁𝘂𝘀  : Online
▸ 🌐 𝗠𝗼𝗱𝗲    : Public
▸ ⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲  : ${hours}h ${minutes}m ${seconds}s

━━━━━━━━━━━━━━━━
   🌟 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦
━━━━━━━━━━━━━━━━
💡 Type *.menu* for full list
👑 𝗕𝘆 : ${sessionSettings.botName}`;

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363426106687970@newsletter',
                    newsletterName: '𝑀𝑼𝑍𝜦𝑀𝜤𝐋-𝑿𝑫',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { text: 'Bot is alive and running!' }, { quoted: message });
    }
}

module.exports = aliveCommand;