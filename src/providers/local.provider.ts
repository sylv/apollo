import SQLite from "better-sqlite3";
import { Bar } from "cli-progress";
import { createWriteStream } from "fs";
import { mkdir, rename, stat } from "fs/promises";
import { Kysely, Selection, sql, SqliteDialect } from "kysely";
import { From } from "kysely/dist/cjs/parser/table-parser";
import fetch from "node-fetch";
import { homedir } from "os";
import debounce from "p-debounce";
import { dirname, join } from "path";
import { registerProvider } from ".";
import { parseImdbId } from "../helpers/parse-imdb-id";
import { log } from "../log";
import { TitleType } from "../types";

interface TitlesTable {
  titleId: number;
  type: TitleType;
  name: string;
  startYear: number | null;
  endYear: number | null;
  runtimeMinutes: number | null;
  genres: string | null;
  seasonCount: number | null;
  episodeCount: number | null;
  averageRating: number | null;
  numVotes: number | null;
}

interface TitlesFtsTable {
  rowid: number;
  name: string;
  rank: number;
}

interface EpisodesTable {
  episodeId: number;
  parentId: number;
  seasonNumber: number;
  episodeNumber: number;
  episodeName: string | null;
  averageRating: number | null;
  numVotes: number | null;
}

interface SeasonsTable {
  parentId: number;
  seasonNumber: number;
  episodeCount: number;
}

interface Database {
  titles: TitlesTable;
  titles_fts: TitlesFtsTable;
  episodes: EpisodesTable;
  seasons: SeasonsTable;
}

// 6 days, most episodes are weekly and some tv shows only release the next episodes title a week before the episode
// so this means we should get the latest episode name
const maxAge = 1000 * 60 * 60 * 24 * 6;
const source = process.env.LOCAL_DATABASE_HTTP_SOURCE || "https://raw.githubusercontent.com/sylv/apollo/master/data/titles.db";

const createFTSTable = (dbPath: string) => {
  log.debug(`Creating FTS table for "${dbPath}"`);
  const db = new SQLite(dbPath);
  db.exec(`
        DROP TABLE IF EXISTS titles_fts;
        CREATE VIRTUAL TABLE IF NOT EXISTS titles_fts USING fts5(name);
        INSERT INTO titles_fts(rowid, name) SELECT titleId, name FROM titles;
    `);

  db.exec(`VACUUM`);
  db.close();
};

const ensureDb = async () => {
  const tempLocation = join(homedir(), ".config/apollo/titles.db.part");
  const finalLocation = join(homedir(), ".config/apollo/titles.db");
  let exists = false;

  if (process.env.FORCE_UPDATE_DATABASE !== "true") {
    try {
      const meta = await stat(finalLocation);
      exists = true;
      let age = Date.now() - meta.mtimeMs;
      if (age <= maxAge) {
        log.debug(`Using cached database at "${finalLocation}"`);
        return finalLocation;
      }
    } catch (error: any) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  try {
    log.info(`Downloading "${source}" to "${tempLocation}"`);
    const response = await fetch(source);
    if (response.status !== 200) {
      throw new Error(`Could not download "${source}": ${response.status}`);
    }

    let bar: Bar | undefined;
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      const parsedLength = Number(contentLength);
      bar = new Bar({
        clearOnComplete: true,
        formatValue: (value, options, type) => {
          switch (type) {
            case "percentage":
              return `${value}%`;
            case "value":
            case "total":
              const formatted = value / 1024 / 1024;
              return `${formatted.toFixed(2)}MB`;
            default:
              return value.toString();
          }
        },
      });

      bar.start(parsedLength, 0);
    }

    await mkdir(dirname(tempLocation), { recursive: true });
    const file = createWriteStream(tempLocation);
    for await (const chunk of response.body) {
      file.write(chunk);
      if (bar) {
        bar.increment(chunk.length);
      }
    }

    if (bar) bar.stop();
    createFTSTable(tempLocation);

    log.debug(`Renaming "${tempLocation}" to "${finalLocation}"`);
    await rename(tempLocation, finalLocation);
    return finalLocation;
  } catch (error) {
    if (exists) {
      log.error(error);
      log.warn(`Failed to download "${source}", using potentially stale database at "${finalLocation}"`);
      return finalLocation;
    }

    throw error;
  }
};

let _db: Kysely<Database>;

const getDatabase = debounce(async () => {
  if (_db) return _db;
  const location = await ensureDb();
  _db = new Kysely({
    dialect: new SqliteDialect({
      database: new SQLite(location, {
        readonly: true,
      }),
    }),
  });

  return _db;
}, 0);

const titleToSearchResult = (
  title: Selection<From<Database, "titles">, "titles", "titleId" | "type" | "name" | "startYear" | "endYear">
) => {
  return {
    ...title,
    imdbId: `tt${title.titleId.toString().padStart(7, "0")}`,
  };
};

registerProvider("local", {
  search: async (searchTerm) => {
    const db = await getDatabase();
    const titleId = parseImdbId(searchTerm)?.titleId;
    if (titleId) {
      const result = await db
        .selectFrom("titles")
        .where("titleId", "=", titleId)
        .select(["titleId", "type", "name", "startYear", "endYear"])
        .executeTakeFirst();
      if (!result) return [];
      return [titleToSearchResult(result)];
    }

    const results = await db
      .selectFrom("titles_fts as result")
      .innerJoin("titles as title", "title.titleId", "result.rowid")
      .where(sql`result.name MATCH ${searchTerm}`)
      .orderBy("result.rank", "asc")
      .orderBy("title.numVotes", "desc")
      .select(["titleId", "type", "result.name", "startYear", "endYear"])
      .limit(10)
      .execute();

    return results.map(titleToSearchResult);
  },
  getEpisode: async (parentId: string, seasonNumber: number, episodeNumber: number) => {
    const intId = +parentId.slice(2);
    const db = await getDatabase();
    const result = await db
      .selectFrom("episodes")
      .where("parentId", "=", intId)
      .where("seasonNumber", "=", seasonNumber)
      .where("episodeNumber", "=", episodeNumber)
      .selectAll()
      .executeTakeFirst();

    if (!result) return null;
    return {
      episodeId: `tt${result.episodeId}`,
      episodeName: result.episodeName || `Episode #${result.seasonNumber}.${result.episodeNumber}`,
    };
  },
});
