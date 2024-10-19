const fs = require('fs');
const strings = require("../strings.json");

module.exports.run = async (client, message, args) => {
    if (!args[0]) {
        return message.channel.send(strings.noArgsProvided); // No user ID provided
    }

    let userId = args[0];

    // If the argument is a mention, extract the user ID from the mention format
    if (userId.startsWith("<@") && userId.endsWith(">")) {
        userId = userId.replace(/[<@!>]/g, ''); // Remove <@ and > characters from the mention
    }

    // Validate if the input is a valid ID (should only contain digits)
    if (!/^\d+$/.test(userId)) {
        return message.channel.send(strings.invalidUserId); // Invalid ID format
    }

    // Check if the user is already whitelisted
    if (!global.config.allowed.includes(userId)) {
        global.config.allowed.push(userId);
        message.channel.send(strings.userWhitelisted.replace("USER_ID", userId)); // Success message

        // Update allowed.json file
        fs.writeFile('./allowed.json', JSON.stringify({ allowed: global.config.allowed }, null, 2), (err) => {
            if (err) {
                console.error("Failed to update allowed.json", err);
                message.channel.send(strings.whitelistUpdateFailed); // File write failure
            } else {
                message.channel.send(strings.whitelistUpdateSuccess); // Success updating the file
            }
        });
    } else {
        message.channel.send(strings.userAlreadyWhitelisted); // User is already whitelisted
    }
};

module.exports.names = {
    list: ["wl", "w", "whitelist"]
};
