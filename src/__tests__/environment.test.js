import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'url';
import {test, expect, describe} from '@jest/globals';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Runtime environment', () => {
  test('if __dirname is correct', () => {
    expect(__dirname).toContain('__tests__');
  });

  test('if config.json exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../', 'data', 'config.json'))).toBe(true);
  });

  test('if config.json is valid JSON', () => {
    expect(() => {
      import('../../data/config.json', {
          assert: {
          type: 'json',
          },
          });
    }).not.toThrow();
  });

  test('if questions.json exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../', 'data', 'questions.json'))).toBe(true);
  });

  test('if questions.json is valid JSON', () => {
    expect(() => {
      import('../../data/questions.json', {
          assert: {
          type: 'json',
          },
          });
    }).not.toThrow();
  });
});
