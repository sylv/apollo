import fs from "fs";
import { copyFile, mkdir, rename, symlink } from "fs/promises";
import { Selectable } from "kysely";
import { dirname } from "path";
import { log } from "../log";
import { addSnapshotEntryToJob, JobTable } from "./snapshots";

export interface MoveFileOptions {
  symlink: boolean;
  from: string;
  to: string;
  dryRun: boolean;
  job: Selectable<JobTable> | null;
}

export async function moveFile(options: MoveFileOptions) {
  if (options.dryRun) return;
  const handler = options.symlink ? symlink : rename;
  await handler(options.from, options.to)
    .catch(async (error) => {
      if (error.code === "ENOENT") {
        const missingDir = dirname(options.to);
        await mkdir(missingDir, { recursive: true });
        return handler(options.from, options.to);
      }

      throw error;
    })
    .catch(async (error) => {
      if (options.symlink === false && error.code === "EXDEV") {
        // handle cross-device errors
        log.warn(`Moving "${options.from}" to "${options.to}" failed because of cross-device errors, falling back to slow copy`);
        await copyFile(options.from, options.to, fs.constants.COPYFILE_EXCL);
        return;
      }

      throw error;
    })
    .catch((error) => {
      if (error.code === "EEXIST") {
        // handle existing files
        log.warn(`Moving "${options.from}" to "${options.to}" failed because of existing files`);
        return;
      }

      throw error;
    });

  if (options.job) {
    await addSnapshotEntryToJob(options.job, options.from, options.to, options.symlink);
  }

  log.debug(`Moved "${options.from}" to "${options.to}"`);
}
