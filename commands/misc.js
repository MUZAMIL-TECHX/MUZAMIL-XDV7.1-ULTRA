const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

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
//                    🖼️ GET IMAGE URL
// ═══════════════════════════════════════════════════════════
async function getQuotedOrOwnImageUrl(sock, message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (quoted?.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return await uploadImage(Buffer.concat(chunks));
    }

    if (message.message?.imageMessage) {
        const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return await uploadImage(Buffer.concat(chunks));
    }

    let targetJid;
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    if (ctx?.mentionedJid?.length > 0) targetJid = ctx.mentionedJid[0];
    else if (ctx?.participant) targetJid = ctx.participant;
    else targetJid = message.key.participant || message.key.remoteJid;

    try {
        return await sock.profilePictureUrl(targetJid, 'image');
    } catch {
        return 'https://i.imgur.com/2wzGhpF.png';
    }
}

// ═══════════════════════════════════════════════════════════
//                    ❤️ HEART HANDLER
// ═══════════════════════════════════════════════════════════
async function handleHeart(sock, chatId, message) {
    try {
        await addReaction(sock, message, '❤️');
        const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
        const url = `https://api.some-random-api.com/canvas/misc/heart?avatar=${encodeURIComponent(avatarUrl)}`;
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

        await addReaction(sock, message, '✅');
        await sock.sendMessage(chatId, {
            image: Buffer.from(response.data),
            caption: box('❤️ ʜᴇᴀʀᴛ', [
                '✅ ꜱᴛᴀᴛᴜꜱ : ɪᴍᴀɢᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ',
                '🎨 ꜱᴛʏʟᴇ : ʜᴇᴀʀᴛ'
            ]),
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in misc heart:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ꜰᴀɪʟᴇᴅ', [
                '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ᴄʀᴇᴀᴛᴇ ʜᴇᴀʀᴛ ɪᴍᴀɢᴇ',
                '💡 ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

// ═══════════════════════════════════════════════════════════
//                    🎨 MISC COMMAND
// ═══════════════════════════════════════════════════════════
async function miscCommand(sock, chatId, message, args) {
    try {
        await addReaction(sock, message, '🎨');

        const sub = (args[0] || '').toLowerCase();
        const rest = args.slice(1);

        // ❌ No subcommand
        if (!sub) {
            await addReaction(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: box('🎨 ᴍɪꜱᴄ ᴄᴏᴍᴍᴀɴᴅꜱ', [
                    '📌 ᴀᴠᴀᴛᴀʀ ᴏɴʟʏ :',
                    '• heart · horny · circle · lgbt',
                    '• lied · lolice · simpcard · tonikawa',
                    '━━━━━━━━━━━━━━━━━━',
                    '📌 ᴡɪᴛʜ ᴛᴇxᴛ :',
                    '• .misc its-so-stupid <text>',
                    '• .misc oogway <quote>',
                    '• .misc oogway2 <quote>',
                    '• .misc namecard user|bday|desc',
                    '• .misc tweet dn|un|comment',
                    '• .misc youtube-comment un|comment',
                    '━━━━━━━━━━━━━━━━━━',
                    '📌 ᴏᴠᴇʀʟᴀʏꜱ :',
                    '• comrade · gay · glass · jail',
                    '• passed · triggered'
                ]),
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // 🖼️ Simple avatar-only endpoints
        async function simpleAvatarOnly(endpoint, title) {
            const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
            const url = `https://api.some-random-api.com/canvas/misc/${endpoint}?avatar=${encodeURIComponent(avatarUrl)}`;
            const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

            await addReaction(sock, message, '✅');
            await sock.sendMessage(chatId, {
                image: Buffer.from(response.data),
                caption: box(`🎨 ${title.toUpperCase()}`, [
                    '✅ ꜱᴛᴀᴛᴜꜱ : ɪᴍᴀɢᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ',
                    `🎨 ꜱᴛʏʟᴇ : ${title}`
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        switch (sub) {
            // 🖼️ Avatar-only
            case 'heart':
                await simpleAvatarOnly('heart', 'Heart');
                break;
            case 'horny':
                await simpleAvatarOnly('horny', 'Horny');
                break;
            case 'circle':
                await simpleAvatarOnly('circle', 'Circle');
                break;
            case 'lgbt':
                await simpleAvatarOnly('lgbt', 'LGBT');
                break;
            case 'lied':
                await simpleAvatarOnly('lied', 'Lied');
                break;
            case 'lolice':
                await simpleAvatarOnly('lolice', 'Lolice');
                break;
            case 'simpcard':
                await simpleAvatarOnly('simpcard', 'Simp Card');
                break;
            case 'tonikawa':
                await simpleAvatarOnly('tonikawa', 'Tonikawa');
                break;

            // 📝 Its So Stupid
            case 'its-so-stupid': {
                const dog = rest.join(' ').trim();
                if (!dog) {
                    await addReaction(sock, message, '❌');
                    await sock.sendMessage(chatId, {
                        text: box('❌ ᴍɪꜱꜱɪɴɢ ᴛᴇxᴛ', [
                            '📌 ᴜꜱᴀɢᴇ : .misc its-so-stupid <text>'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const url = `https://api.some-random-api.com/canvas/misc/its-so-stupid?dog=${encodeURIComponent(dog)}&avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

                await addReaction(sock, message, '✅');
                await sock.sendMessage(chatId, {
                    image: Buffer.from(response.data),
                    caption: box('🐶 ɪᴛꜱ ꜱᴏ ꜱᴛᴜᴘɪᴅ', [
                        `📝 ᴛᴇxᴛ : ${dog}`,
                        '✅ ꜱᴛᴀᴛᴜꜱ : ɢᴇɴᴇʀᴀᴛᴇᴅ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
                break;
            }

            // 🎴 Namecard
            case 'namecard': {
                const joined = rest.join(' ');
                const [username, birthday, description] = joined.split('|').map(s => (s || '').trim());
                if (!username || !birthday) {
                    await addReaction(sock, message, '❌');
                    await sock.sendMessage(chatId, {
                        text: box('❌ ᴍɪꜱꜱɪɴɢ ᴀʀɢᴜᴍᴇɴᴛꜱ', [
                            '📌 ᴜꜱᴀɢᴇ : .misc namecard user|bday|desc',
                            '🔍 ᴇxᴀᴍᴘʟᴇ : .misc namecard John|01-01-2000|Hello'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const params = new URLSearchParams({ username, birthday, avatar: avatarUrl });
                if (description) params.append('description', description);
                const url = `https://api.some-random-api.com/canvas/misc/namecard?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

                await addReaction(sock, message, '✅');
                await sock.sendMessage(chatId, {
                    image: Buffer.from(response.data),
                    caption: box('🎴 ɴᴀᴍᴇᴄᴀʀᴅ', [
                        `👤 ᴜꜱᴇʀ : ${username}`,
                        `📅 ʙᴅᴀʏ : ${birthday}`,
                        description ? `📝 ᴅᴇꜱᴄ : ${description}` : '📝 ᴅᴇꜱᴄ : —',
                        '✅ ꜱᴛᴀᴛᴜꜱ : ɢᴇɴᴇʀᴀᴛᴇᴅ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
                break;
            }

            // 🐢 Oogway
            case 'oogway':
            case 'oogway2': {
                const quote = rest.join(' ').trim();
                if (!quote) {
                    await addReaction(sock, message, '❌');
                    await sock.sendMessage(chatId, {
                        text: box('❌ ᴍɪꜱꜱɪɴɢ ǫᴜᴏᴛᴇ', [
                            `📌 ᴜꜱᴀɢᴇ : .misc ${sub} <quote>`
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const url = `https://api.some-random-api.com/canvas/misc/${sub}?quote=${encodeURIComponent(quote)}&avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

                await addReaction(sock, message, '✅');
                await sock.sendMessage(chatId, {
                    image: Buffer.from(response.data),
                    caption: box('🐢 ᴏᴏɢᴡᴀʏ', [
                        `💬 ǫᴜᴏᴛᴇ : ${quote.length > 60 ? quote.substring(0, 57) + '...' : quote}`,
                        '✅ ꜱᴛᴀᴛᴜꜱ : ɢᴇɴᴇʀᴀᴛᴇᴅ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
                break;
            }

            // 🐦 Tweet
            case 'tweet': {
                const joined = rest.join(' ');
                const [displayname, username, comment, theme] = joined.split('|').map(s => (s || '').trim());
                if (!displayname || !username || !comment) {
                    await addReaction(sock, message, '❌');
                    await sock.sendMessage(chatId, {
                        text: box('❌ ᴍɪꜱꜱɪɴɢ ᴀʀɢᴜᴍᴇɴᴛꜱ', [
                            '📌 ᴜꜱᴀɢᴇ : .misc tweet dn|un|comment|theme',
                            '🔍 ᴇxᴀᴍᴘʟᴇ : .misc tweet John|john123|Hello!'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const params = new URLSearchParams({ displayname, username, comment, avatar: avatarUrl });
                if (theme) params.append('theme', theme);
                const url = `https://api.some-random-api.com/canvas/misc/tweet?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

                await addReaction(sock, message, '✅');
                await sock.sendMessage(chatId, {
                    image: Buffer.from(response.data),
                    caption: box('🐦 ᴛᴡᴇᴇᴛ', [
                        `👤 ɴᴀᴍᴇ : ${displayname}`,
                        `🏷️ ᴜꜱᴇʀ : @${username}`,
                        `💬 ᴄᴏᴍᴍᴇɴᴛ : ${comment.length > 60 ? comment.substring(0, 57) + '...' : comment}`,
                        theme ? `🎨 ᴛʜᴇᴍᴇ : ${theme}` : '🎨 ᴛʜᴇᴍᴇ : Default',
                        '✅ ꜱᴛᴀᴛᴜꜱ : ɢᴇɴᴇʀᴀᴛᴇᴅ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
                break;
            }

            // ▶️ YouTube Comment
            case 'youtube-comment': {
                const joined = rest.join(' ');
                const [username, comment] = joined.split('|').map(s => (s || '').trim());
                if (!username || !comment) {
                    await addReaction(sock, message, '❌');
                    await sock.sendMessage(chatId, {
                        text: box('❌ ᴍɪꜱꜱɪɴɢ ᴀʀɢᴜᴍᴇɴᴛꜱ', [
                            '📌 ᴜꜱᴀɢᴇ : .misc youtube-comment user|comment',
                            '🔍 ᴇxᴀᴍᴘʟᴇ : .misc youtube-comment John|Nice video!'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const params = new URLSearchParams({ username, comment, avatar: avatarUrl });
                const url = `https://api.some-random-api.com/canvas/misc/youtube-comment?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

                await addReaction(sock, message, '✅');
                await sock.sendMessage(chatId, {
                    image: Buffer.from(response.data),
                    caption: box('▶️ ʏᴏᴜᴛᴜʙᴇ ᴄᴏᴍᴍᴇɴᴛ', [
                        `👤 ᴜꜱᴇʀ : ${username}`,
                        `💬 ᴄᴏᴍᴍᴇɴᴛ : ${comment.length > 60 ? comment.substring(0, 57) + '...' : comment}`,
                        '✅ ꜱᴛᴀᴛᴜꜱ : ɢᴇɴᴇʀᴀᴛᴇᴅ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
                break;
            }

            // 🖼️ Overlay endpoints
            case 'comrade':
            case 'gay':
            case 'glass':
            case 'jail':
            case 'passed':
            case 'triggered': {
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const url = `https://api.some-random-api.com/canvas/overlay/${sub}?avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

                await addReaction(sock, message, '✅');
                await sock.sendMessage(chatId, {
                    image: Buffer.from(response.data),
                    caption: box(`🎨 ${sub.toUpperCase()}`, [
                        '✅ ꜱᴛᴀᴛᴜꜱ : ɪᴍᴀɢᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ',
                        `🎨 ꜱᴛʏʟᴇ : ${sub}`
                    ]),
                    ...channelInfo
                }, { quoted: message });
                break;
            }

            // ❓ Unknown
            default:
                await addReaction(sock, message, '❓');
                await sock.sendMessage(chatId, {
                    text: box('❓ ᴜɴᴋɴᴏᴡɴ ꜱᴜʙᴄᴏᴍᴍᴀɴᴅ', [
                        `🔴 ᴜɴᴋɴᴏᴡɴ : ${sub}`,
                        '💡 ᴜꜱᴇ .misc ꜰᴏʀ ʟɪꜱᴛ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
                break;
        }

    } catch (error) {
        console.error('Error in misc command:', error);
        await addReaction(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: box('❌ ꜰᴀɪʟᴇᴅ', [
                '🔴 ꜰᴀɪʟᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ɪᴍᴀɢᴇ',
                '💡 ᴄʜᴇᴄᴋ ʏᴏᴜʀ ᴘᴀʀᴀᴍᴇᴛᴇʀꜱ'
            ]),
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = { miscCommand, handleHeart };