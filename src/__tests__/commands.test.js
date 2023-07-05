import path from 'node:path';
import {fileURLToPath} from 'url';
import {BotLogger} from '../utils.js';
import {test, describe, expect} from '@jest/globals';
import {deployCommands, getCommandFiles, getCommandData} from '../deploy-commands.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandFiles = getCommandFiles(path.join(__dirname, '../', 'commands'));

describe('Commands', () => {
  test('Files can be found', () => {
    expect(commandFiles).not.toHaveLength(0);
  });

  test('Are all valid', () => {
    commandFiles.forEach(async (file) => {
      const fp = path.join(__dirname, '../', 'commands', file);
      const command = await import(fp);

      expect('data' in command && 'execute' in command).toBe(true);
    });
  });

  test('Have unique names', () => {
    const commandNames = [];

    commandFiles.forEach(async (file) => {
      const fp = path.join(__dirname, '../', 'commands', file);
      const command = await import(fp);

      commandNames.push(command.data.name);
    });

    expect(commandNames).toEqual([...new Set(commandNames)]);
  });

  test('Data can be fetched', () => {
    const fp = path.join(__dirname, '../', 'commands', commandFiles.at(0));
    getCommandData(fp).then((data) => {
      expect(data).not.toBe(null);
    });

    getCommandData('invalid-file-path').then((data) => {
      expect(data).toBe(null);
    });

    const mockfilepaths = path.join(__dirname, '../', '__tests__', 'mock_cmd.js');
    getCommandData(mockfilepaths).then((data) => {
      expect(data).toBe(null);
    });
  });

  // TODO: fix the dynamic import issue
  test.skip('Deploying commands works', () => {
    import('../../data/config.json', {
        assert: {
        type: 'json',
        }}).then((config) => {
      if (config.default.token!='') {
        // if token exists, test that all commands are deployed
        // if tests are done through github actions, use environment variables instead
        // since we're using the import() in deploy-commands.js, we need to make
        const useenv = process.env.ACTIONS == '1';
        const logger = new BotLogger();
        deployCommands(useenv, logger).then((data) => {
          expect(data).toHaveLength(commandFiles.length);
        });
      }
    });
  });
});
