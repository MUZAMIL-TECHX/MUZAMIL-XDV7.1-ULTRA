const { runYoutubeAudioCommand } = require('../lib/youtube-audio');

async function songCommand(sock, chatId, message) {
    return runYoutubeAudioCommand(sock, chatId, message);
}

module.exports = songCommand;
