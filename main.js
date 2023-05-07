const fs = require('node:fs');
const path = require('node:path');
const {Client, Events} = require('discord.js');

// load token from ./data/config.json
const {token} = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'config.json')));

const client = new Client({
  intents: 8,
});


client.once(Events.ClientReady, () => [
  console.log['Client ready!'],
]);

client.commands = [];

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  const fp = path.join(__dirname, 'commands', file);
  const command = require(fp);

  if ('data' in command && 'execute' in command) {
    client.commands.push(command);
  } else {
    console.log(`Invalid command file ${fp}`);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.find((cmd) => cmd.data.name === interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (e) {
    console.log(e);
  }
});

client.login(token);
