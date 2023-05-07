import {startBot} from './bot.js';
import {deployCommands} from './deploy-commands.js';

(() => {
  //* Do all important initialization here
  startBot();
  deployCommands();
})();
