import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'url';
import {test, expect} from '@jest/globals';
import {deployCommands} from '../deploy-commands.js';

test('deployCommands() registers all commands', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const commandFiles = fs.readdirSync(path.join(__dirname, '..', 'commands')).filter((file) => file.endsWith('.js'));
  return deployCommands().then((commands) => {
    expect(commands.length).toBe(commandFiles.length);
  });
});
