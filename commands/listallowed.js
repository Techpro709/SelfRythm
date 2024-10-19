module.exports.run = async (client, message, args) => {
    const allowedUsers = global.config.allowed;
    
    // If there are no users in the allowed list
    if (allowedUsers.length === 0) {
        return message.channel.send("✅ No users are currently allowed.");
    }

    let usernames = [];

    // Fetch each user by ID and push their username to the array
    for (let userId of allowedUsers) {
        try {
            const user = await client.users.fetch(userId);
            usernames.push(user.username);
        } catch (err) {
            console.error(`Could not fetch user with ID ${userId}`, err);
        }
    }

    if (usernames.length === 0) {
        return message.channel.send("❌ Could not retrieve any allowed users.");
    }

    // Send the list of allowed usernames to the channel
    message.channel.send(`✅ Allowed users: \n${usernames.join('\n')}`);
};

module.exports.names = {
    list: ["listallowed", "la", "allowedlist"]
};
