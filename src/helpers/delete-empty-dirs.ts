import { readdir, rmdir } from "fs/promises";
import { join } from "path";

const isDeletable = async (directory: string) => {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      const shouldDelete = await isDeletable(entryPath);
      if (!shouldDelete) {
        // child directory has files so the child *and* parent cannot be deleted
        return false;
      }

      await rmdir(entryPath);
    } else {
      return false;
    }
  }

  return true;
};

/**
 * Delete empty directories in the given directory.
 * @param directory The directory to scan, this directory will not be deleted if empty after this function is called.
 */
export const deleteEmptyDirs = async (directory: string) => {
  // todo: should use opendir() but its not available in tests
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const entryPath = join(directory, entry.name);
      const shouldDelete = await isDeletable(entryPath);
      if (shouldDelete) {
        await rmdir(entryPath);
      }
    }
  }
};
