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
//                    🆔 MAIN JID COMMAND
// ═══════════════════════════════════════════════════════════
async function jidCommand(sock, chatId, message) {
    try {
        await addReaction(sock, message, '🆔');

        const text = message.message?.conversation ||
                     message.message?.extendedTextMessage?.text || '';

        const link = text.replace(/^\.(?:jid|getjid)\b/i, '').trim();

        if (!link) {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('🆔 ᴊɪᴅ ᴄᴏᴍᴍᴀɴᴅ', [
                    '📌 ᴜsᴀɢᴇ : .ᴊɪᴅ [ʟɪɴᴋ]',
                    '🔍 ᴄʜᴀɴɴᴇʟ : .ᴊɪᴅ https://whatsapp.com/channel/xxxxx',
                    '🔍 ɢʀᴏᴜᴘ  : .ᴊɪᴅ https://chat.whatsapp.com/xxxxx',
                    '━━━━━━━━━━━━━━━━━━',
                    '💡 ᴄᴏᴘʏ ʟɪɴᴋ ꜰʀᴏᴍ ᴄʜᴀɴɴᴇʟ/ɢʀᴏᴜᴘ'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        await addReaction(sock, message, '🔄');

        let jid = null;
        let type = null;
        let title = null;
        let extraInfo = null;

        // ═══════════════════════════════════════
        // CHANNEL LINK
        // ═══════════════════════════════════════
        if (link.includes('whatsapp.com/channel/')) {
            try {
                const match = link.match(/whatsapp\.com\/channel\/([a-zA-Z0-9]+)/);
                if (!match) throw new Error('Invalid channel link');

                const inviteCode = match[1];
                console.log(`[JID] Channel invite code: ${inviteCode}`);

                // ✅ WhatsApp internal function (No external API)
                const channelInfoRes = await sock.newsletterMetadata('invite', inviteCode);

                if (channelInfoRes && channelInfoRes.id) {
                    jid = channelInfoRes.id;
                    title = channelInfoRes.name || 'Unknown Channel';
                    type = 'CHANNEL';
                    extraInfo = {
                        subscribers: channelInfoRes.subscriberCount || null,
                        description: channelInfoRes.description || null
                    };
                    console.log(`[JID] Channel JID: ${jid}`);
                } else {
                    throw new Error('Could not fetch channel metadata');
                }
            } catch (channelError) {
                console.error('[JID] Channel error:', channelError.message);
                await addReaction(sock, message, '❌');
                return await sock.sendMessage(chatId, {
                    text: box('❌ ᴄʜᴀɴɴᴇʟ ᴇʀʀᴏʀ', [
                        `🔴 ${channelError.message || 'Could not fetch channel'}`,
                        '💡 ᴄʜᴇᴄᴋ ʟɪɴᴋ ᴏʀ ᴛʀʏ ᴀɢᴀɪɴ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            }
        }
        // ═══════════════════════════════════════
        // GROUP LINK
        // ═══════════════════════════════════════
        else if (link.includes('chat.whatsapp.com/')) {
            try {
                const match = link.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
                if (!match) throw new Error('Invalid group link');

                const inviteCode = match[1];
                console.log(`[JID] Group invite code: ${inviteCode}`);

                // ✅ WhatsApp internal function (No external API)
                const groupInfo = await sock.groupGetInviteInfo(inviteCode);

                if (groupInfo && groupInfo.id) {
                    jid = groupInfo.id;
                    title = groupInfo.subject || 'Unknown Group';
                    type = 'GROUP';
                    extraInfo = {
                        members: groupInfo.size || groupInfo.participants?.length || null,
                        description: groupInfo.desc || null,
                        owner: groupInfo.owner || null
                    };
                    console.log(`[JID] Group JID: ${jid}`);
                } else {
                    throw new Error('Could not fetch group metadata');
                }
            } catch (groupError) {
                console.error('[JID] Group error:', groupError.message);
                await addReaction(sock, message, '❌');
                return await sock.sendMessage(chatId, {
                    text: box('❌ ɢʀᴏᴜᴘ ᴇʀʀᴏʀ', [
                        `🔴 ${groupError.message || 'Could not fetch group'}`,
                        '💡 ᴄʜᴇᴄᴋ ʟɪɴᴋ ᴏʀ ᴛʀʏ ᴀɢᴀɪɴ'
                    ]),
                    ...channelInfo
                }, { quoted: message });
            }
        }
        // ═══════════════════════════════════════
        // INVALID LINK
        // ═══════════════════════════════════════
        else {
            await addReaction(sock, message, '❌');
            return await sock.sendMessage(chatId, {
                text: box('❌ ɪɴᴠᴀʟɪᴅ ʟɪɴᴋ', [
                    '🔴 ᴏɴʟʏ ᴄʜᴀɴɴᴇʟ ᴏʀ ɢʀᴏᴜᴘ ʟɪɴᴋꜱ ᴀᴄᴄᴇᴘᴛᴇᴅ',
                    '━━━━━━━━━━━━━━━━━━',
                    '✅ ᴄʜᴀɴɴᴇʟ :',
                    'https://whatsapp.com/channel/xxxxx',
                    '✅ ɢʀᴏᴜᴘ :',
                    'https://chat.whatsapp.com/xxxxx'
                ]),
                ...channelInfo
            }, { quoted: message });
        }

        // ═══════════════════════════════════════
        // SEND RESULT
        // ═══════════════════════════════════════
        if (jid) {
            await addReaction(sock, message, '✅');

            const lines = [
                `📌 ᴛʏᴘᴇ : ${type}`,
                `🆔 ᴊɪᴅ : ${jid}`,
                `📛 ɴᴀᴍᴇ : ${title || 'Unknown'}`
            ];

            if (extraInfo?.members) {
                lines.push(`👥 ᴍᴇᴍʙᴇʀꜱ : ${extraInfo.members}`);
            }
            if (extraInfo?.subscribers) {
                lines.push(`👥 sᴜʙꜱᴄʀɪʙᴇʀꜱ : ${extraInfo.subscribers}`);
            }
            if (extraInfo?.owner) {
                lines.push(`👑 ᴏᴡɴᴇʀ : ${extraInfo.owner.split('@')[0]}`);
            }
            if (extraInfo?.description) {
                const desc = extraInfo.description.length > 60 
                    ? extraInfo.description.substring(0, 57) + '...' 
                    : extraInfo.description;
                lines.push(`📝 ᴅᴇꜱᴄ : ${desc}`);
            }

            lines.push('━━━━━━━━━━━━━━━━━━');
            lines.push('✅ ᴊɪᴅ ꜰᴏᴜɴᴅ sᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ');

            await sock.sendMessage(chatId, {
                text: box(`${type === 'CHANNEL' ? '📢' : '👥'} ᴊɪᴅ ʀᴇꜱᴜʟᴛ`, lines),
                ...channelInfo
            }, { quoted: message });
        }

    } catch (error) {
        console.error('[JID] Error:', error);
        await addReaction(sock, message, '❌');

        let errorMsg = error.message || 'Something went wrong';
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

module.exports = jidCommand;