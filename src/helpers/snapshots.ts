import Database from "better-sqlite3";
import { unlink } from "fs/promises";
import { Generated, Kysely, Selectable, SqliteAdapter, SqliteDialect } from "kysely";
import { homedir } from "os";
import { join } from "path";
import { moveFile } from "./move-file";

// .returning() with kysely will silently fail and return an empty object because it doesnt think
// sqlite supports returning *, but modern versions do, so this is a hacky workaround to get kysely to play nice.
Object.defineProperty(SqliteAdapter.prototype, "supportsReturning", {
  get: () => true,
});

interface EntryTable {
  id: Generated<number>;
  fromPath: string;
  toPath: string;
  jobId: number;
  symlink: 1 | 0;
  restored: 1 | 0;
}

export interface JobTable {
  id: Generated<number>;
  inputDirectory: string;
  outputDirectory: string;
  createdAt: number;
}

export interface Entry {
  id: number;
  fromPath: string;
  toPath: string;
  symlink: boolean;
  jobId: number;
}

export const snapshotDbPath = join(homedir(), ".config/apollo/snapshots.db");
const database = new Database(snapshotDbPath, { fileMustExist: false });
database.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY,
    inputDirectory TEXT NOT NULL,
    outputDirectory TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY,
    fromPath TEXT NOT NULL,
    toPath TEXT NOT NULL,
    symlink INTEGER NOT NULL,
    restored INTEGER NOT NULL,
    jobId INTEGER NOT NULL REFERENCES jobs(id)
  );

  CREATE INDEX IF NOT EXISTS entries_jobId ON entries (jobId);
`);

const db = new Kysely<{ jobs: JobTable; entries: EntryTable }>({
  dialect: new SqliteDialect({
    database: database,
  }),
});

/**
 * Create a new job that can have entries appended to it.
 * @param inputDirectory The input directory where the files will be discovered
 * @param outputDirectory The output directory where the files will be moved to
 * @returns A new job to append entries to
 */
export async function createSnapshotJob(inputDirectory: string, outputDirectory: string) {
  const job = await db
    .insertInto("jobs")
    .values({
      inputDirectory: inputDirectory,
      outputDirectory: outputDirectory,
      createdAt: Date.now(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return job;
}

/**
 * Add an entry to a rename job.
 * This will allow the change to be rolled back in the future.
 * @param job The job to add the entry to.
 * @param from The location the file was moved from
 * @param to The location the file was moved to
 * @param isSymlink Whether the entry moved the file or symlinked it. Changes rollback behaviour.
 */
export async function addSnapshotEntryToJob(job: Selectable<JobTable>, from: string, to: string, isSymlink: boolean) {
  await db
    .insertInto("entries")
    .values({
      fromPath: from,
      toPath: to,
      jobId: job.id,
      symlink: isSymlink ? 1 : 0,
      restored: 0,
    })
    .execute();
}

/**
 * Get entries for the last job in the given input directory.
 * @see {@link rollback}
 */
export async function readLastJobEntries(inputDirectory: string): Promise<Entry[]> {
  // this was beautiful and used streaming and an asyncgenerator and was all cool and poggers
  // but then it turns out streaming doesnt work with sqlite :(
  let qb = db.selectFrom("jobs").orderBy("createdAt", "desc").selectAll();
  if (inputDirectory) {
    qb = qb.where("inputDirectory", "=", inputDirectory);
  }

  const latestJob = await qb.executeTakeFirst();
  if (!latestJob) return [];
  const results = await db
    .selectFrom("entries")
    .where("jobId", "=", latestJob.id)
    .where("restored", "!=", 1)
    .select(["id", "fromPath", "toPath", "symlink", "jobId"])
    .execute();

  return results.map((item) => ({
    id: item.id,
    fromPath: item.fromPath,
    toPath: item.toPath,
    symlink: item.symlink === 1,
    jobId: item.jobId,
  }));
}

/**
 * Roll back changes to the given input directory.
 * @returns the number of items rolled back, "0" means no entries were found.
 */
export const rollback = async (inputDirectory: string) => {
  const entries = await readLastJobEntries(inputDirectory);
  let restored = 0;
  for (const entry of entries) {
    if (entry.symlink) {
      await unlink(entry.toPath);
    } else {
      await moveFile({
        from: entry.toPath,
        to: entry.fromPath,
        symlink: false,
        dryRun: false,
        job: null,
      });
    }

    restored++;
    await db.updateTable("entries").where("id", "=", entry.id).set({ restored: 1 }).execute();
  }

  return restored;
};
