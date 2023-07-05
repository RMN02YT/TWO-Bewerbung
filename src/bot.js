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
import {Client, Events, Collection} from 'discord.js';
import {getDirname} from './utils.js';
import data from '../data/config.json' assert {type: 'json'};

/**
 * The main bot function
 * @function startBot
 * @param {boolean} useEnv Whether to use the environment variables
 * @param {BotLogger} logger The logger
 * @return {void}
 */
export function startBot(useEnv = false, logger) {
  const component ='bot';
  logger.info(component, 'Starting bot');
  useEnv ? logger.info('Using environment variables') : logger.info(component, 'Using config.json');
  const t = useEnv ? process.env.BOT_TOKEN : data.token;

  const client = new Client({
    intents: 8,
  });


  client.once(Events.ClientReady, () => [
    logger.info(component, 'Bot ready'),
  ]);

  client.commands = new Collection();

  const __dirname = getDirname(import.meta.url);
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter((file) => file.endsWith('.js'));


  commandFiles.forEach((file) => {
    const fp = path.join('file://', __dirname, 'commands', file);
    // use dynamic imports to load command files
    import(fp).then((command) => {
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        logger.error(component, `Invalid command file ${file}`);
      }
    }).catch((e) => {
      logger.error(component, e);
    });
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction, logger);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
      } else {
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
      }
    }
  });

  client.login(t);
}
