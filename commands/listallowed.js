module.exports.run = async (client, message, args) => {
    const allowedUsers = global.config.allowed;

    // If there are no users in the allowed list
    if (allowedUsers.length === 0) {
        return message.channel.send("✅ No users are currently allowed.");
    }

    let userDetails = [];

    // Fetch each user by ID and push their username and ID to the array
    for (let userId of allowedUsers) {
        try {
            const user = await client.users.fetch(userId);
            userDetails.push(`${user.username}\`\`\`${user.id}\`\`\``);
        } catch (err) {
            console.error(`Could not fetch user with ID ${userId}`, err);
            userDetails.push(`Could not fetch user with ID ${userId}`);
        }
    }

    if (userDetails.length === 0) {
        return message.channel.send("❌ Could not retrieve any allowed users.");
    }

    // Send the list of allowed usernames and IDs to the channel
    message.channel.send(`✅ Allowed users:\n${userDetails.join('\n')}`);
};

module.exports.names = {
    list: ["listallowed", "la", "allowedlist"]
};
