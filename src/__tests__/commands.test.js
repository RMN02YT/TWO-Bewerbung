import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'url';
import {test, describe, expect} from '@jest/globals';
import {deployCommands} from '../deploy-commands.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Commands', () => {
  const commandFiles = fs.readdirSync(path.join(__dirname, '../', 'commands')).filter((file) => file.endsWith('.js'));

  test('if all commands are valid', () => {
    commandFiles.forEach(async (file) => {
      const fp = path.join(__dirname, '../', 'commands', file);
      const command = await import(fp);

      expect('data' in command && 'execute' in command).toBe(true);
    });
  });

  test('if all commands have a unique name', () => {
    const commandNames = [];

    commandFiles.forEach(async (file) => {
      const fp = path.join(__dirname, '../', 'commands', file);
      const command = await import(fp);

      commandNames.push(command.data.name);
    });

    expect(commandNames).toEqual([...new Set(commandNames)]);
  });

  test('if all commands are deployable', () => {
    import('../../data/config.json', {
        assert: {
        type: 'json',
        }}).then((config) => {
      if (config.default.token!='') {
        // if token exists, test that all commands are deployed
        expect(deployCommands()).toHaveLength(commandFiles.length);
      }
    });
  });
});
