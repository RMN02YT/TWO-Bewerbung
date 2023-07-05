import {startBot} from './bot.js';
import {deployCommands} from './deploy-commands.js';
import {BotLogger} from './utils.js';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
const args = yargs(hideBin(process.argv)).argv;


(async () => {
  const mainLogger = new BotLogger();
  if (args.env) {
    await deployCommands(true, mainLogger);
    startBot(true, mainLogger);
  } else {
    await deployCommands(false, mainLogger);
    startBot(false, mainLogger);
  }
})();
