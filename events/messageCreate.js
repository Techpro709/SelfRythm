const fs = require('fs');
const path = require('path');
const prefix = global.config.prefix;
const owners = global.config.owner; // Now owners is an array
const strings = require('../strings.json');
const utils = require('../utils');

module.exports = (client, message) => {
    if (message.content.indexOf(prefix) === 0) {
        if (message.author.id === client.user.id) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        const cmd = client.commands.get(command);
        if (!cmd) return;

        // Ensure allowed.json exists and has valid content
        const allowedFilePath = path.join(__dirname, '../allowed.json');

        if (!fs.existsSync(allowedFilePath)) {
            // Create allowed.json if it doesn't exist
            fs.writeFileSync(allowedFilePath, JSON.stringify({ allowed: [] }, null, 2));
            global.config.allowed = [];
        } else {
            // Read allowed.json
            const allowedData = JSON.parse(fs.readFileSync(allowedFilePath));
            global.config.allowed = allowedData.allowed || [];
        }

        // Check if the user is not allowed and the allowed list is not empty
        if (!global.config.allowed.includes(message.author.id) && !owners.includes(message.author.id)) {
            message.channel.send(strings.permissionDenied);
            utils.log(`${message.author.username} tried to run the command '${message.content}' but permission was not accepted #notallowed`);
            return;
        }

        // Check for whitelist command and restrict it to the owner(s)
        if (cmd.names.list.includes("whitelist") && !owners.includes(message.author.id)) {
            message.channel.send(strings.permissionDenied);
            utils.log(`${message.author.username} tried to run the command '${message.content}' but permission was not accepted #whitelist`);
            return;
        }

        // Check for blacklist command: If the message content includes the owner ID, deny it
        if (cmd.names.list.includes("blacklist") && owners.some(ownerID => message.content.includes(ownerID))) {
            message.channel.send(strings.cannotBlacklistOwner);
            utils.log(`${message.author.username} tried to blacklist the owner with the command '${message.content}' #blacklistowner`);
            return;
        }

        cmd.run(client, message, args);
    }
};
