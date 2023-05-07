import {startBot} from './bot.js';
import {deployCommands} from './deploy-commands.js';

(() => {
  startBot();
  deployCommands();
})();
