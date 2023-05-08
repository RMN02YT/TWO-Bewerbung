import path from 'path';
import {fileURLToPath} from 'url';
import npmlog from 'npmlog';
import chalk from 'chalk';

/**
 * Function to get the __dirname
 * @param {string} metaUrl The import.meta.url
 * @return {string} The __dirname
 */
export function getDirname(metaUrl) {
  return path.dirname(fileURLToPath(metaUrl));
}

/**
 * Class to create a logger
 * @class BotLogger
 * @property {npmlog.Logger} logger The logger
 * @property {string[]} levels The levels
 * @property {string[]} components The components
 * @property {Object[]} pstyles The styles
 * @property {Function} heading The heading
 * @property {Function} getLogger The getLogger function
 * @property {Function} log The log function
 * @property {Function} info The info function
 * @property {Function} debug The debug function
 * @property {Function} warn The warn function
 * @property {Function} error The error function
 * @exports BotLogger
 */
export class BotLogger {
  /**
   * Creates an instance of BotLogger
   * @constructor
   * @memberof BotLogger
   * @property {npmlog.Logger} logger The logger
   * @exports BotLogger
   */
  constructor() {
    this.logger = npmlog;
    this.levels = ['info', 'debug', 'warn', 'error'];
    this.components = ['main', 'bot', 'deploy', 'command'];
    this.logger.level = 'info';
    this.logger.addLevel('warn', 2000, {fg: 'yellow', bold: true});
    this.logger.addLevel('error', 2500, {fg: 'red', bold: true});
    this.logger.addLevel('debug', 1500, {fg: 'blue', bold: true});
    this.logger.addLevel('info', 1000, {fg: 'green', bold: true});
    this.pstyles = [
      [
        (x) => {
          const now = new Date();
          return chalk.white.bold(`[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`) + chalk.hex('#3A86FF').bold(`[${x}]`);
        },
        (x) => {
          return chalk.hex('#3A86FF')(`${x}`);
        },
      ],
      [
        (x) => {
          const now = new Date();
          return chalk.white.bold(`[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`) + chalk.hex('#8338EC').bold(`[${x}]`);
        },
        (x) => {
          return chalk.hex('#8338EC')(`${x}`);
        },
      ],
      [
        (x) => {
          const now = new Date();
          return chalk.white.bold(`[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`) + chalk.hex('#8338EC').bold(`[${x}]`);
        },
        (x) => {
          return chalk.hex('#8338EC')(`${x}`);
        },
      ],
      [
        (x) => {
          const now = new Date();
          return chalk.white.bold(`[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`) + chalk.hex('#FB5607').bold(`[${x}]`);
        },
        (x) => {
          return chalk.hex('#FB5607')(`${x}`);
        },
      ],
    ];
  }

  /**
   * Function to get the logger
   * @return {npmlog.Logger} The logger
   * @memberof BotLogger
    */
  getLogger() {
    return this.logger;
  }

  /**
   * Function to log a simple message
   * @param {prefix} prefix The prefix of the message
   * @param {string} message The message to log
   * @info Basic log is always "info"
   * @memberof BotLogger
   */
  info(prefix = 'main', message) {
    this.logger.info(this.pstyles[this.components.indexOf(prefix)][0](prefix), this.pstyles[this.components.indexOf(prefix)][1](message));
  }

  /**
   * Function to log a debug message
   * @param {prefix} prefix The prefix of the message
   * @param {string} message The message to log
   * @memberof BotLogger
   * @info Debug log is always "debug"
   */
  debug(prefix = 'main', message) {
    this.logger.debug(this.pstyles[this.components.indexOf(prefix)][0](prefix), this.pstyles[this.components.indexOf(prefix)][1](message));
  }

  /**
   * Function to log an error message
   * @param {prefix} prefix The prefix of the message
   * @param {string} message The message to log
   * @memberof BotLogger
   * @info Error log is always "error"
  */
  error(prefix = 'main', message) {
    this.logger.error(this.pstyles[this.components.indexOf(prefix)][0](prefix), this.pstyles[this.components.indexOf(prefix)][1](message));
  }

  /**
   * Function to log a warning message
   * @param {prefix} prefix The prefix of the message
   * @param {string} message The message to log
   * @memberof BotLogger
   * @info Warning log is always "warn"
  */
  warn(prefix = 'main', message) {
    this.logger.warn(this.pstyles[this.components.indexOf(prefix)][0](prefix), this.pstyles[this.components.indexOf(prefix)][1](message));
  }
}
