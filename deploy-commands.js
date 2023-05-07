/* eslint-disable linebreak-style */
const fs = require('node:fs');
const path = require('node:path');
const {REST, Routes} = require('discord.js');

const {token, clientId, guildId} = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'config.json')));

const commands = [];

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter((file) => file.endsWith('.js'));
console.log(commandFiles);

commandFiles.forEach((file) => {
  const fp = path.join(__dirname, 'commands', file);
  const command = require(fp);

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(command.data.toJSON());
  } else {
    console.log(`Invalid command file ${fp}`);
  }
});

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Refreshing ${commands.length} commands`);

    const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        {body: commands},
    );

    console.log(`Successfully reloaded ${data.length} commands`);
  } catch (e) {
    console.log(e);
  }
})();
