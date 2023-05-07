/**
 * @file deploy-commands.js
 * @requires node:fs
 * @requires node:path
 * @requires node:url
 * @requires discord.js
 * @requires discord.js:REST
 * @requires discord.js:Routes
 * @exports deployCommands
 * @exports getCommandFiles
 * @exports getCommandData
 */
import fs from 'node:fs';
import path from 'node:path';
import {REST, Routes} from 'discord.js';
import {getDirname} from './utils.js';
import data from '../data/config.json' assert {type: 'json'};


/**
 * Function to get the list of command files
 * @return {string[]} The list of command files
 */
export function getCommandFiles() {
  const __dirname = getDirname(import.meta.url);
  return fs.readdirSync(path.join(__dirname, 'commands')).filter((file) => file.endsWith('.js'));
}

/**
 * Function to validate a command file and extract the data
 * @param {string} filePath
 * @return {Promise<JSON>}
 */
export async function getCommandData(filePath) {
  if (!filePath.endsWith('.js')) return null;
  const command = await import(filePath);
  if ('data' in command && 'execute' in command) {
    return command.data.toJSON();
  } else {
    console.log(`Invalid command file ${filePath}`);
    return null;
  }
}

/**
 * Function to deploy the commands
 * @function deployCommands
 * @param {boolean} useEnv Whether to use the environment variables
 * @param {pino.Logger} logger The logger
 * @return {Promise<JSON>} The JSON data of the commands that were deployed
 */
export async function deployCommands(useEnv = false, logger) {
  const component ='deploy';
  logger.info(component, 'Deploying commands');
  useEnv ? logger.info(component, 'Using environment variables') : logger.info(component, 'Using config.json');
  const t = useEnv ? process.env.BOT_TOKEN : data.token;
  const c = useEnv ? process.env.CLIENT_ID : data.clientId;
  const g = useEnv ? process.env.GUILD_ID : data.guildId;

  const commands = [];
  const __dirname = getDirname(import.meta.url);
  const commandFiles = getCommandFiles();
  logger.info(component, `Found ${commandFiles.length} command file${commandFiles.length === 1 ? '' : 's'}`);

  for (const file of commandFiles) {
    const filePath = path.join('file://', __dirname, 'commands', file);
    const commandData = await getCommandData(filePath);
    if (commandData) {
      commands.push(commandData);
    }
  }
  const rest = new REST().setToken(t);
  try {
    logger.info(component, `Refreshing ${commands.length} commands`);
    const data = await rest.put(
        Routes.applicationGuildCommands(c, g),
        {body: commands},
    );
    logger.info(component, 'Successfully refreshed application (/) commands.', data);
    return commands;
  } catch (e) {
    throw new Error(e);
  }
}

