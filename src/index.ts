import fs from "fs";
import rrdir from "rrdir";
import sanitize from "sanitize-filename";
import path from "path";
import { EXCLUDE_BLACKLIST_REGEX } from "./constants";
import { ApolloParser } from "./parser";
import { apollo } from "./types";
import { log } from "./helpers/log";

export * from "./types";
export * from "./parser";

export class Apollo {
  protected readonly options: apollo.Options;
  protected readonly log = log.scope("apollo");
  protected createdDirectories = new Set();
  protected handledFiles = new Set();

  constructor(options: apollo.Options) {
    this.options = options;
  }

  /**
   * Run the parser with the given options.
   */
  async run() {
    let checkedCount = 0;
    let newCount = 0;

    for await (const file of rrdir.stream(this.options.input, { stats: true })) {
      if (file.directory) continue;
      if ((file.stats as fs.Stats).size < this.options.minSize) {
        this.log.debug(`Skipping "${file.path}" as it is too small`);
        continue;
      }

      const blacklisted = file.path.match(EXCLUDE_BLACKLIST_REGEX);
      if (blacklisted) {
        this.log.debug(`Skipping "${file.path}" as it contains undesirable keywords`);
        continue;
      }

      const parser = new ApolloParser();
      const parsed = await parser.parse(file.path);
      if (!parsed) continue;
      const output = this.getFileOutputPath(parsed);

      // can't create a path that already exists
      if (this.handledFiles.has(output.path)) {
        this.log.warn(`Skipping "${file.path}" as the output path "${output.path}" already exists`);
        continue;
      }

      if (!this.createdDirectories.has(output.directory)) {
        await fs.promises.mkdir(output.directory, { recursive: true });
      }

      const action = this.options.move ? "moving" : "linking";
      try {
        checkedCount += 1;

        if (!this.options.dryRun) {
          // move or create symlinks based on options
          if (this.options.move) await fs.promises.rename(file.path, output.path);
          else fs.promises.symlink(file.path, output.path);
        }

        this.log.info(`${action} "${file.path}" -> "${output.path}"`);
        this.handledFiles.add(output.path);
        newCount += 1;
      } catch (e) {
        if (e.code === "EPERM") {
          this.log.error(`EPERM: permission error ${action} "${file.path}" -> "${output.path}".`);
          return process.exit(1);
        } else if (e.code === "EEXIST") {
          this.log.debug(`Failed ${action} "${output.path}" as the destination already exists.`);
          continue;
        }

        throw e;
      }
    }

    this.log.info(`Checked ${checkedCount.toLocaleString()} files and moved ${newCount.toLocaleString()} new files`);
  }

  /**
   * Get the path a parsed title should be outputted to.
   */
  protected getFileOutputPath(parsed: apollo.Parsed) {
    const title = sanitize(parsed.title);
    let outputPath: string;

    if (parsed.episodeNumber.length) {
      const parentDir = parsed.seasonNumber ? `Season ${parsed.seasonNumber}` : "Unknown Season";
      const paddedSeason = parsed.seasonNumber ? "S" + parsed.seasonNumber.toString().padStart(2, "0") : "";
      const paddedEpisode = parsed.episodeNumber.map(n => n.toString().padStart(2, "0")).join("-");
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
