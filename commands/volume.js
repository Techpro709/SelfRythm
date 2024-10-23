const strings = require("../strings.json");
const utils = require("../utils");

module.exports.run = async (client, message, args) => {

    const serverQueue = queue.get("queue");

    if (!serverQueue) return message.channel.send(strings.nothingPlayingVolume);

    if (args.length > 1) return message.channel.send(strings.toMuchArgsVolume);
    if (args.length === 0) return message.channel.send(strings.currentVolume.replace("VOLUME", serverQueue.volume));

    let floatVolume = parseFloat(args[0]);

    if (!Number.isInteger(parseInt(args[0])) && !utils.isFloat(floatVolume) && args[0] !== "earrape")
        return message.channel.send(strings.noNumber);

    // Find the user's voice channel globally across all guilds
    let voiceChannel = client.guilds.cache
        .map(guild => guild.members.cache.get(message.author.id)?.voice.channel)
        .find(channel => channel != null);

    if (!voiceChannel) {
        return message.channel.send(strings.notInVocal); // If no voice channel is found
    }

    // "Earrape" command logic
    if (args[0] === "earrape") {

        message.channel.send(strings.earrapeWarning)
            .then(async function (warning) {

                await warning.react('✅');

                const filter = (reaction, user) => {
                    return reaction.emoji.name === "✅"
                        && global.config.allowed.includes(user.id); // Only allow reactions from allowed users
                };

                const collector = warning.createReactionCollector(filter, { max: 1, time: 8000 });

                collector.on('collect', (reaction, user) => {
                    // Ensure the user reacting is in the allowed list
                    if (!global.config.allowed.includes(user.id)) {
                        return message.channel.send(strings.notAllowedToEarrape); // Optional message
                    }

                    const oldVolume = serverQueue.volume;
                    serverQueue.volume = 100;
                    serverQueue.connection._state.subscription.player._state.resource.volume.setVolumeLogarithmic(100 / 5);
                    message.channel.send(strings.startEarrape);
                    setTimeout(function () {
                        message.channel.send(strings.endEarrape.replace("VOLUME", oldVolume));
                        serverQueue.volume = oldVolume;
                        return serverQueue.connection._state.subscription.player._state.resource.volume.setVolumeLogarithmic(oldVolume / 5);
                    }, 5000);
                });

                collector.on('end', collected => {
                    if (collected.size === 0) return message.channel.send(strings.earrapeFail);
                });

            });
    } else {
        // Volume change logic
        if (args[0] > 10) return message.channel.send(strings.volumeToHigh);

        message.channel.send(strings.volumeChanged.replace("VOLUME", args[0]));

        serverQueue.volume = floatVolume;
        serverQueue.connection._state.subscription.player._state.resource.volume.setVolumeLogarithmic(100 / 5);
        return serverQueue.connection._state.subscription.player._state.resource.volume.setVolumeLogarithmic(floatVolume / 5);
    }
};

module.exports.names = {
    list: ["volume", "v"]
};
