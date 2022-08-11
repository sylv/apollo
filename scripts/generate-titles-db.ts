import Database, { Statement } from "better-sqlite3";
import { execSync } from "child_process";
import progress from "cli-progress";
import { createReadStream, createWriteStream, existsSync, readFileSync } from "fs";
import fetch from "node-fetch";
import { join } from "path";
import { createInterface } from "readline";
import { createGunzip } from "zlib";
import { parseType } from "../src/helpers/parse-type";
import { TitleType } from "../src/types";

const batchSize = 500;
const dbPath = join(__dirname, "../data/titles.db");
const db = new Database(dbPath);
const genericNameRegex = /^(Episode) #?[0-9]+/i;
db.pragma("journal_mode = wal");

const sources = {
  titles: {
    url: "https://datasets.imdbws.com/title.basics.tsv.gz",
    upsert: () => {
      db.exec(`DROP TABLE IF EXISTS titles`);
      db.exec(
        `CREATE TABLE IF NOT EXISTS titles (
            titleId INTEGER PRIMARY KEY, 
            type INTEGER NOT NULL, 
            name TEXT, 
            startYear INTEGER, 
            endYear INTEGER, 
            runtimeMinutes INTEGER, 
            genres TEXT
          )
          `
      );
    },
    map: (column) => {
      const type = parseType(column.titleType);
      if (type === undefined) return;
      const title = {
        titleId: Number(column.tconst.slice(2)),
        type: type,
        name: column.primaryTitle,
        startYear: column.startYear ? Number(column.startYear) : null,
        endYear: column.endYear ? Number(column.endYear) : null,
        runtimeMinutes: Number(column.runtimeMinutes),
        genres: column.genres,
      };

      if (title.type === TitleType.EPISODE && genericNameRegex.test(title.name)) {
        title.name = null;
      }

      return title;
    },
  },
  episodes: {
    url: "https://datasets.imdbws.com/title.episode.tsv.gz",
    upsert: () => {
      db.exec(`DROP TABLE IF EXISTS episodes`);
      db.exec(`CREATE TABLE IF NOT EXISTS episodes (
        episodeId INTEGER PRIMARY KEY, 
        parentId INTEGER, 
        seasonNumber INTEGER NOT NULL, 
        episodeNumber INTEGER NOT NULL
      );
      
      CREATE INDEX episodes_parentId_index ON episodes (parentId);
      `);
    },
    map: (column) => {
      const episode = {
        episodeId: Number(column.tconst.slice(2)),
        parentId: Number(column.parentTconst.slice(2)),
        seasonNumber: Number(column.seasonNumber),
        episodeNumber: Number(column.episodeNumber),
      };

      if ((!episode.seasonNumber && episode.seasonNumber !== 0) || (!episode.episodeNumber && episode.episodeNumber !== 0)) {
        return null;
      }

      return episode;
    },
  },
  ratings: {
    url: `https://datasets.imdbws.com/title.ratings.tsv.gz`,
    upsert: () => {
      db.exec(`DROP TABLE IF EXISTS ratings`);
      db.exec(`CREATE TABLE IF NOT EXISTS ratings (
          titleId INTEGER PRIMARY KEY, 
          averageRating INTEGER NOT NULL, 
          numVotes INTEGER NOT NULL
        )`);
    },
    map: (column) => ({
      titleId: Number(column.tconst.slice(2)),
      averageRating: Number(column.averageRating),
      numVotes: Number(column.numVotes),
    }),
  },
} as const;

function countLines(path: string): number {
  const result = execSync(`wc -l ${path}`);
  return Number(result.toString().split(" ")[0]);
}

async function downloadUrl(url: string, tableName: string) {
  const downloadTo = `/tmp/${tableName}.tsv`;
  const existing = process.env.USE_CACHED !== "false" ? existsSync(downloadTo) : null;
  if (existing) {
    console.log(`Using cached download of "${url}" at "${downloadTo}"`);
    return downloadTo;
  }

  console.log(`Downloading "${url}" to "${downloadTo}"`);
  const response = await fetch(url);

  // setup progress bar
  const contentLength = Number(response.headers.get("content-length"));
  const bar = new progress.Bar({ barsize: 40, clearOnComplete: true }, progress.Presets.shades_grey);
  bar.start(contentLength, 0);

  // setup unzip stream
  const gunzip = createGunzip();
  gunzip.pipe(createWriteStream(downloadTo));

  // write to unzip stream + log progress
  let done = 0;
  for await (const chunk of response.body) {
    done += chunk.length;
    gunzip.write(chunk);
    bar.update(done);
  }

  bar.stop();
  return downloadTo;
}

async function main() {
  for (const [tableName, { url, upsert, map }] of Object.entries(sources)) {
    const tsvPath = await downloadUrl(url, tableName);

    console.log(`Importing table "${tableName}"`);
    const lines = countLines(tsvPath);
    const bar = new progress.Bar({ barsize: 40, clearOnComplete: true }, progress.Presets.shades_grey);
    bar.start(lines, 0);

    const tsvStream = createReadStream(tsvPath);
    const rl = createInterface({ input: tsvStream });

    upsert();
    let insert: Statement | undefined;
    const insertMany = db.transaction((values) => {
      for (const value of values) {
        insert!.run(value);
      }
    });

    let header: string[] = [];
    let batch: any[] = [];
    for await (const line of rl) {
      bar.increment();

      if (!header[0]) {
        // extract header info
        header = line.split("\t");
        continue;
      }

      // convert the line to an object
      const row = line.split("\t").reduce((acc, value, index) => {
        const cleanValue = value === "\\N" ? null : value;
        return Object.assign(acc, { [header[index]]: cleanValue });
      }, {});

      // convert the row object to an object matching the sql schema
      let mapped: any;
      try {
        mapped = map(row);
        if (!mapped) continue;
      } catch (error) {
        console.error({ error, row });
        continue;
      }

      if (!insert) {
        insert = db.prepare(`INSERT INTO ${tableName} VALUES (${Object.keys(mapped).map((key) => `$${key}`)})`);
      }

      batch.push(mapped);
      if (batch.length >= batchSize) {
        // flush the batch
        insertMany(batch);
        batch = [];
      }
    }

    // flush the final batch, necessary with an odd number of rows
    insertMany(batch);
    batch = [];
    bar.stop();
  }

  console.log(`Extrapolating tables`);
  db.exec(readFileSync(join(__dirname, "generate-titles-db.sql"), "utf8"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
