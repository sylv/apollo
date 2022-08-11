import { stat } from "fs/promises";
import { basename, dirname, join } from "path";
import { ApolloParser, ApolloParserOptions } from "./classes/apollo-parser";
import { SUBTITLE_EXTENSIONS } from "./constants";
import { deleteEmptyDirs } from "./helpers/delete-empty-dirs";
import { moveFile } from "./helpers/move-file";
import { recursiveReaddir } from "./helpers/recursive-readdir";
import { replacePlaceholders } from "./helpers/replace-placeholders";
import { createSnapshotJob } from "./helpers/snapshots";
import { log } from "./log";
import { ApolloOutput, FileType, TitleType } from "./types";

export enum ApolloMode {
  Move,
  Symlink,
}

export enum ApolloStrategy {
  FileNames,
  Directory,
  Hybrid,
}

export interface RenameOptions extends ApolloParserOptions {
  inputDirectory: string;
  outputDirectory: string;
  strategy: ApolloStrategy;
  mode: ApolloMode;
  dryRun?: boolean;
  minSize: number | null;
  useSnapshots?: boolean;
  deleteEmptyDirs?: boolean;
  formats?: {
    episode?: string;
    movie?: string;
  };
}

export const defaultSnapshotFile = ".apollo-snapshot.json";
export const defaultEpisodeFormat = `TV Shows/{name} ({startYear}) [imdbId={imdbId}]/Season {seasonNumber}/{name} - S{seasonNumber}E{episodeNumber} - {episodeName}.{extension}`;
export const defaultMovieFormat = `Movies/{name} ({startYear}) [imdbId={imdbId}]/{name} ({startYear}).{extension}`;

function formatFilePath(options: RenameOptions, parsed: ApolloOutput) {
  if (parsed.fileType === FileType.Subtitle && parsed.languages?.length === 1) {
    // change extensions from ".srt" to ".en.srt" etc when we extract a single language
    // no need to convert to a code - languages property already attempts to do that from names like "french"
    parsed.extension = `.${parsed.languages[0]}${parsed.extension}`.toLowerCase();
  }

  if (parsed.titleType === TitleType.EPISODE) {
    const episodeFormat = options.formats?.episode ?? defaultEpisodeFormat;
    return replacePlaceholders(episodeFormat, parsed);
  } else if (parsed.titleType === TitleType.MOVIE) {
    const movieFormat = options.formats?.movie ?? defaultMovieFormat;
    return replacePlaceholders(movieFormat, parsed);
  } else {
    throw new Error(`Unknown title type "${parsed.titleType}"`);
  }
}

const STANDARD_SEASON_EPISODE_REGEX = /S[0-9]{1,4}E[0-9]{1,4}/;

function getFilePath(options: RenameOptions, filePath: string, parsed: ApolloOutput) {
  const formatted = formatFilePath(options, parsed);
  const originalFilename = basename(filePath);
  const useStrategy =
    options.strategy === ApolloStrategy.Hybrid
      ? STANDARD_SEASON_EPISODE_REGEX.test(originalFilename)
        ? ApolloStrategy.Directory
        : ApolloStrategy.FileNames
      : options.strategy;

  switch (useStrategy) {
    case ApolloStrategy.FileNames:
      return join(options.outputDirectory, formatted);
    case ApolloStrategy.Directory:
      const fullFormatted = join(options.outputDirectory, formatted);
      const withoutFilename = dirname(fullFormatted);
      return join(withoutFilename, originalFilename);
    default:
      throw new Error(`Unknown strategy "${useStrategy}"`);
  }
}

export async function renameFiles(options: RenameOptions) {
  const job = options.useSnapshots ? await createSnapshotJob(options.inputDirectory, options.outputDirectory) : null;
  for await (const filePath of recursiveReaddir(options.inputDirectory)) {
    const shortPath = filePath.slice(options.inputDirectory.length + 1);
    const isSubtitle = SUBTITLE_EXTENSIONS.some((ext) => filePath.endsWith(ext));
    if (!isSubtitle && options.minSize) {
      const meta = await stat(filePath);
      if (meta.size < options.minSize) {
        console.debug(`Skipping "${shortPath}" because it's too small`);
        continue;
      }
    }

    const strippedPath = filePath.slice(options.inputDirectory.length + 1);
    const parser = new ApolloParser(options);
    const parsed = await parser.parse(strippedPath, filePath);
    const isValidMovie = parsed?.titleType === TitleType.MOVIE;
    const isValidEpisode =
      parsed?.titleType === TitleType.EPISODE && parsed.seasonNumber !== undefined && parsed.episodeNumber?.length !== 0;

    if (!parsed?.name || (!isValidMovie && !isValidEpisode)) {
      log.warn(`Skipping "${shortPath}" as data could not be extracted`);
      continue;
    }

    const outputPath = getFilePath(options, filePath, parsed);
    await moveFile({
      dryRun: options.dryRun ?? false,
      from: filePath,
      to: outputPath,
      symlink: options.mode === ApolloMode.Symlink,
      job: job,
    });
  }

  if (options.deleteEmptyDirs) {
    log.info(`Deleting empty directories in "${options.inputDirectory}"`);
    await deleteEmptyDirs(options.inputDirectory);
  }
}
