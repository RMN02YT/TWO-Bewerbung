/**
 * @fileoverview The main bot file
 * @module bot
 * @requires node:fs
 * @requires node:path
 * @requires discord.js
 * @requires discord.js:Client
 * @requires discord.js:Events
 * @exports startBot
 */
import fs from 'node:fs';
import path from 'node:path';
import {Client, Events} from 'discord.js';
import {fileURLToPath} from 'url';
import token from '../data/config.json' assert {type: 'json'};

/**
 * The main bot function
 * @function startBot
 * @return {void}
 */
export function startBot() {
  // load token from ./data/config.json

  const client = new Client({
    intents: 8,
  });


  client.once(Events.ClientReady, () => [
    console.log['Client ready!'],
  ]);

  client.commands = [];

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  console.log(__dirname);
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter((file) => file.endsWith('.js'));


  commandFiles.forEach((file) => {
    const fp = path.join(__dirname, 'commands', file);
    // use dynamic imports to load command files
    const command = import(fp);

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
}
