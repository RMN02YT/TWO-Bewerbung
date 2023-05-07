import path from 'path';
import {fileURLToPath} from 'url';

/**
 * Function to get the __dirname
 * @param {string} metaUrl The import.meta.url
 * @return {string} The __dirname
 */
export function getDirname(metaUrl) {
  return path.dirname(fileURLToPath(metaUrl));
}
