const utils = require('../utils');

module.exports = client => {

    client.user.setActivity("alex's dry song taste", {type: "LISTENING"});

    utils.log(`Logged in as ${client.user.username} !`);

};