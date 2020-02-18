import fs from "fs";
import rrdir from "rrdir";
import sanitize from "sanitize-filename";
import signale from "signale";
import path from "path";
import { EXCLUDE_BLACKLIST } from "./constants";
import { ApolloParser } from "./parser";
import { apollo } from "./types";

export class Apollo {
  protected readonly options: apollo.Options;
  protected readonly log = signale.scope("apollo");
  protected createdDirectories = new Set();
  protected createdFiles = new Set();

  constructor(options: apollo.Options) {
    this.options = options;
  }

  async run() {
    for await (const file of rrdir.stream(this.options.input, { stats: true })) {
      if (file.directory) continue;
      if ((file.stats as fs.Stats).size < this.options.minSize) {
        this.log.debug(`Skipping "${file.path}" as it is too small`);
        continue;
      }

      const blacklisted = file.path.match(EXCLUDE_BLACKLIST);
      if (blacklisted) {
        this.log.debug(`Skipping "${file.path}" as it contains undesirable keywords`);
        continue;
      }

      const parser = new ApolloParser();
      const parsed = await parser.parse(file.path);
      if (!parsed) continue;
      parsed.extension = ".txt";
      const output = this.getFileOutputPath(parsed);
      if (!this.createdDirectories.has(output.directory)) {
        await fs.promises.mkdir(output.directory, { recursive: true });
      }

      this.log.debug(`CREATE ${output.path}`);
      fs.writeFileSync(output.path, file.path);
      // await fs.promises.(file.path, output.path);
    }
  }

  protected getFileOutputPath(parsed: apollo.Parsed) {
    const title = sanitize(parsed.title);
    let outputPath: string;

    if (parsed.episodeNumber) {
      const parentDir = parsed.seasonNumber ? `Season ${parsed.seasonNumber}` : "Unknown Season";
      const paddedSeason = parsed.seasonNumber ? "S" + parsed.seasonNumber.toString().padStart(2, "0") : "";
      const paddedEpisode = parsed.episodeNumber.toString().padStart(2, "0");
      const loc = `TV Shows/${title}/${parentDir}/${title} ${paddedSeason}E${paddedEpisode}${parsed.extension}`;
      outputPath = path.join(this.options.output, loc);
    } else {
      const yearSuffix = parsed.startYear && ` (${parsed.startYear})`;
      const joined = sanitize(yearSuffix ? title + yearSuffix : title);
      outputPath = path.join(this.options.output, `Movies/${joined}/${joined}${parsed.extension}`);
    }

    return {
      directory: path.dirname(outputPath),
      path: outputPath
    };
  }
}
