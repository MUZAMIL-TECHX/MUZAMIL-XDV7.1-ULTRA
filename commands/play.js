const { runYoutubeAudioCommand } = require('../lib/youtube-audio');

async function playCommand(sock, chatId, message) {
    return runYoutubeAudioCommand(sock, chatId, message);
}

module.exports = playCommand;
