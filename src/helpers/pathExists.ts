import fs from 'fs';

/**
 * Check whether the given path exists on disk
 * @param path "C:\media", "/mnt/media", etc
 */
export async function pathExists(path: string) {
  try {
    await fs.promises.stat(path);
    return true;
  } catch (e) {
    return false;
  }
}
