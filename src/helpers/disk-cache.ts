import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import ms from "ms";
import { homedir } from "os";
import { join } from "path";

interface EntryTable {
  key: string;
  value: string;
  expiresAt?: number;
}

const cachePath = join(homedir(), ".config/apollo/cache.db");
const database = new Database(cachePath, { fileMustExist: true });

database.exec(`
    CREATE TABLE IF NOT EXISTS entries (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expiresAt INTEGER
    );
`);

const db = new Kysely<{ entries: EntryTable }>({
  dialect: new SqliteDialect({
    database: database,
  }),
});

export class DiskCache<T> {
  private static readonly PURGE_INTERVAL = ms("15m");
  private lastPurged: number | null = null;
  private ttlMs: number | null;
  constructor(readonly keyPrefix: string, readonly ttl?: string) {
    this.ttlMs = ttl ? ms(ttl) : null;
    this.purge();
  }

  async set(key: string, value: T) {
    this.purge();
    const expiresAt = this.ttlMs ? Date.now() + this.ttlMs : undefined;
    await db
      .insertInto("entries")
      .values({
        key: this.keyPrefix + key,
        value: JSON.stringify(value),
        expiresAt: expiresAt,
      })
      .execute();
  }

  async get(key: string): Promise<T | undefined> {
    this.purge();
    const entry = await db
      .selectFrom("entries")
      .select("value")
      .where("key", "=", this.keyPrefix + key)
      .where("expiresAt", ">", Date.now())
      .executeTakeFirst();

    if (!entry) return undefined;
    return JSON.parse(entry.value);
  }

  private purge() {
    if (this.lastPurged && Date.now() - this.lastPurged < DiskCache.PURGE_INTERVAL) return;
    db.deleteFrom("entries").where("expiresAt", "<", Date.now()).execute();
    this.lastPurged = Date.now();
  }
}
