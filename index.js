const Discord = require("discord.js-selfbot-v13");
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES
  ],  
  checkUpdate: false,
});
const fs = require('fs');
const Enmap = require('enmap');
const utils = require('./utils');
const { Player } = require("discord-player");

if (!process.env.TOKEN){
  try{
    const config = require("./config");
    global.config = {'token': config.token, 'prefix': config.prefix, 'owner': config.owner};
  } catch (e){
    console.error("No config file found, create it or use environnement variables.");
    process.exit(1);
  };
} else{
  if (!process.env.PREFIX) process.env.PREFIX="$";
  global.config = {'token': process.env.TOKEN, 'prefix': process.env.PREFIX, 'owner': process.env.owner};
}
if (!process.env.ALLOWED){
  try {global.config.allowed=require("./allowed.json").allowed}
  catch (e){
    global.config.allowed=[]
  }
} else{
  global.config.allowed=process.env.ALLOWED
}
client.login(config.token)

utils.log("Logging in...");

/* ----------------------------------------------- */

global.queue = new Map();
client.commands = new Enmap();

client.player = new Player(client, {
  ytdlOptions: {
      quality: "highestaudio",
      highWaterMark: 1 << 25
  }
})

/* ----------------------------------------------- */

var loaded = {events: [], commands: []};

var promise = new Promise((resolve) => {
  fs.readdir('./events/', (err, files) => {
    if (err) return console.error;
    files.forEach(file => {
      if (!file.endsWith('.js')) return;
      const evt = require(`./events/${file}`);
      let evtName = file.split('.')[0];
      loaded.events.push(evtName)
      client.on(evtName, evt.bind(null, client));
    });
    resolve();
  });
});


fs.readdir('./commands/', async (err, files) => {
  if (err) return console.error;
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    let props = require(`./commands/${file}`);
    
    // Show command aliases in the table
    const commandAliases = props.names.list.join(', ');  // Joins all aliases into a comma-separated string
    loaded.commands.push(`${file.split('.')[0]} (${commandAliases})`);

    props.names.list.forEach(name => {
      client.commands.set(name, props);
    })
  });

  // Log the table with command aliases
  promise.then(() => {
    utils.log(`Table of commands and events:\n${utils.showTable(loaded)}`);
  });
});