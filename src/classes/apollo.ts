import fs from "fs-extra";
import path from "path";
import rrdir from "rrdir";
import sanitize from "sanitize-filename";
import { SUBTITLE_EXTENSIONS } from "../constants";
import { ApolloLogger, ApolloOptions, ApolloOutput } from "../types";
import { ApolloParser } from "./apollo-parser";

export class Apollo {
  protected readonly options: ApolloOptions;
  protected readonly log?: ApolloLogger;
  protected createdDirectories = new Set();
  protected handledFiles = new Set();

  constructor(options: ApolloOptions) {
    this.options = options;
    this.log = options.logger;
    if (this.options.disableLookup) {
      this.log?.info(`IMDb queries are disabled due to --disable-lookup.`);
    }
  }

  /**
   * Run the parser with the given options.
   */
  async run() {
    let checkedCount = 0;
    let newCount = 0;

    for await (const file of rrdir(this.options.input, { stats: true })) {
      if (file.directory) continue;
      const isSubtitle = SUBTITLE_EXTENSIONS.some((ext) => file.path.endsWith(ext));
      if (!isSubtitle && file.stats!.size < this.options.minSize) {
        this.log?.debug(`Skipping "${file.path}" as it is too small and not a subtitle file`);
        continue;
      }

      const inputPath = file.path.slice(this.options.input.length + 1);
      const parser = new ApolloParser(this.options);
      const parsed = await parser.parse(inputPath);
      if (!parsed || !parsed.title) {
        this.log?.warn(`Skipping "${file.path}" as no data could be extracted. Run with --debug for more info.`);
        continue;
      }

      const output = this.getFileOutputPath(parsed);
      // can't create a path that already exists
      if (this.handledFiles.has(output.path)) {
        this.log?.warn(`Skipping "${file.path}" as the output path "${output.path}" already exists`);
        continue;
      }

      if (!this.createdDirectories.has(output.directory)) {
        await fs.mkdirp(output.directory);
        this.createdDirectories.add(output.directory);
      }

      const action = this.options.move ? "moving" : "linking";
      try {
        checkedCount += 1;
        if (!this.options.dryRun) {
          // move or create symlinks based on options
          if (this.options.move) await fs.move(file.path, output.path);
          else fs.symlink(file.path, output.path);
        }

        this.log?.info(`${action} "${file.path}" -> "${output.path}"`);
        this.handledFiles.add(output.path);
        newCount += 1;
      } catch (error: any) {
        if (error.code === "EPERM") {
          this.log?.error(`EPERM: permission error ${action} "${file.path}" -> "${output.path}".`);
          return process.exit(1);
        } else if (error.code === "EEXIST") {
          this.log?.debug(`Failed ${action} "${output.path}" as the destination already exists.`);
          continue;
        }

        throw error;
      }
    }

    this.log?.info(`Checked ${checkedCount.toLocaleString()} files and moved ${newCount.toLocaleString()} new files`);
  }

  /**
   * Get the path a parsed title should be outputted to.
   */
  protected getFileOutputPath(parsed: ApolloOutput) {
    if (!parsed.title) throw new Error(`Missing title on input`);
    const title = sanitize(parsed.title);
    let outputPath: string;

    if (parsed.episodeNumber?.length) {
      const parentDir = parsed.seasonNumber ? `Season ${parsed.seasonNumber}` : "Unknown Season";
      const paddedSeason = parsed.seasonNumber ? "S" + parsed.seasonNumber.toString().padStart(2, "0") : "";
      const paddedEpisode = parsed.episodeNumber.map((n) => n.toString().padStart(2, "0")).join("-");
      const loc = `TV Shows/${title}/${parentDir}/${title} ${paddedSeason}E${paddedEpisode}${parsed.extension}`;
      outputPath = path.join(this.options.output, loc);
    } else {
      const yearSuffix = parsed.startYear && ` (${parsed.startYear})`;
      const joined = sanitize(yearSuffix ? title + yearSuffix : title);
      outputPath = path.join(this.options.output, `Movies/${joined}/${joined}${parsed.extension}`);
    }

    return {
      directory: path.dirname(outputPath),
      path: outputPath,
    };
  }
}
