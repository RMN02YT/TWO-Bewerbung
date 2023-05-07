/**
 * @file deploy-commands.js
 * @requires node:fs
 * @requires node:path
 * @requires discord.js
 * @requires discord.js:REST
 * @requires discord.js:Routes
 * @exports deployCommands
 */
import fs from 'node:fs';
import path from 'node:path';
import {REST, Routes} from 'discord.js';
import {fileURLToPath} from 'url';
import token from '../data/config.json' assert {type: 'json'};
import clientId from '../data/config.json' assert {type: 'json'};
import guildId from '../data/config.json' assert {type: 'json'};

/**
 * The function to deploy Slash commands to discord
 * @function deployCommands
 * @return {Array} commands
 */
export function deployCommands() {
  const commands = [];

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter((file) => file.endsWith('.js'));
  console.log(`Found ${commandFiles.length} commands`);

  commandFiles.forEach(async (file) => {
    const fp = path.join(__dirname, 'commands', file);
    const command = await import(fp);

    if ('data' in command && 'execute' in command) {
      console.log(`Adding command ${command.data.name} to be deployed`);
      commands.push(command.data.toJSON());
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
      throw new Error(e);
    }
  })();
  return commands;
}
