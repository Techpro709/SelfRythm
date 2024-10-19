const utils = require('../utils');

module.exports = client => {

    client.user.setActivity("zoahir", {type: "LISTENING"});

    utils.log(`Logged in as ${client.user.username} !`);

};