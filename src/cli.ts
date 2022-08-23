import chalk from "chalk";
import fs from "fs";
import isAdmin from "is-admin";
import meow from "meow";
import { resolve } from "path";
import xbytes from "xbytes";
import { ApolloParser } from "./classes/apollo-parser";
import { coloriseResult } from "./helpers/colorise";
import { rollback, snapshotDbPath } from "./helpers/snapshots";
import { setLogger } from "./log";
import { providers } from "./providers";
import { ApolloMode, ApolloStrategy, defaultEpisodeFormat, defaultMovieFormat, renameFiles, RenameOptions } from "./rename";

const providerNames = [...providers.keys()];
const providerList = `"${providerNames.join('", "')}"`;
const cli = meow(
  `
      ${chalk.cyan.bold("Example")}
      $ apollo move ./torrents ./clean
      $ apollo move ./torrents/**/*.mkv ./clean
      $ apollo move D:\\Torrents E:\\Media
      $ apollo link D:\\Torrents E:\\Media
      $ apollo rollback ./torrents
      $ apollo parse The.Walking.Dead.S05E01.720p.HDTV.x264-EVOLVE.mkv

      ${chalk.cyan.bold("Commands")}
      move          Move files from the input directory to the output directory.
      link          Link files from the input directory to the output directory.
      rollback      Make a best-effort attempt to undo changes made by the move or link commands.   
      parse         Parse the given input and show the result with colour coding.   

      ${chalk.cyan.bold("Options")}
      --debug                       Enable verbose logging

      --episode-format              The format to use for subtitles and videos labelled as episodes.
                                    Missing placeholders are stripped in a best-effort attempt, for example "My File [imdbId={imdbId}]" will
                                    become "My File" if the "imdbId" property is missing. This means you can be quite aggressive with
                                    what you put in the format, as anything missing will be stripped cleanly.
                                    ${chalk.bold("Default")}: "${defaultEpisodeFormat}"

      --movie-format                The format to use for subtitles and videos labelled as movies.
                                    The same rules apply as with "--episode-format".
                                    ${chalk.bold("Default")}: "${defaultMovieFormat}"
      
      --dry-run                     Disables file system operations, including creating snapshots.

      --min-size                    The minimum size of a media file to be considered valid. Defaults to "25MB".

      --snapshot                    Whether to use snapshots for the ability to rollback changes. Defaults to "true". Uses "${snapshotDbPath}"

      --delete-empty-dirs           Delete empty directories in the input after moving files. 
                                    Will delete ALL empty directories, not just ones that are empty after moving files.

      --detect-subtitle-language    Detect the language of subtitles by reading the file and guessing the language. May slow down processing on network shares.

      --strategy                    The strategy to use when renaming files. 
                                      "filenames", to rename directories and files. (default)
                                      "directory", to only rename parent directories and leave file names alone.
                                      "hybrid", the same as "filenames" but will only rename files if the season and 
                                                episode format is not standard like S00E00. This maintains metadata 
                                                like release info and may be better for sonarr/radarr.

      --providers                   A comma-separated list of metadata providers. Defaults to "local,imdb". 
                                    The order determines priority, "local,imdb" will use the local provider and fall back to IMDb if there are no matches.
                                    Valid providers are ${providerList}. Set to "false" to disable entirely, using only metadata in the file name.
`,
  {
    allowUnknownFlags: false,
    flags: {
      debug: {
        default: false,
        type: "boolean",
      },
      help: {
        default: false,
        type: "boolean",
      },
      episodeFormat: {
        default: defaultEpisodeFormat,
        type: "string",
      },
      movieFormat: {
        default: defaultMovieFormat,
        type: "string",
      },
      dryRun: {
        default: false,
        type: "boolean",
      },
      minSize: {
        default: "25MB",
        type: "string",
      },
      snapshot: {
        default: true,
        type: "boolean",
      },
      deleteEmptyDirs: {
        default: false,
        type: "boolean",
      },
      detectSubtitleLanguage: {
        default: true,
        type: "boolean",
      },
      strategy: {
        default: "filenames",
        type: "string",
      },
      providers: {
        default: "local,imdb",
        type: "string",
      },
    },
  }
);

function resolveStrategy(input: string) {
  switch (input) {
    case "filenames":
      return ApolloStrategy.FileNames;
    case "directory":
      return ApolloStrategy.Directory;
    case "hybrid":
      return ApolloStrategy.Hybrid;
    default:
      throw new Error(`Invalid strategy "${input}"`);
  }
}

function resolveProviders(input: string) {
  if (input === "false") return [];
  return input.split(",");
}

async function main() {
  const cwd = process.cwd();
  if (cli.flags.debug) {
    setLogger(console);
  }

  switch (cli.input[0]) {
    case "move":
    case "link": {
      const inputDir = cli.input[1] && resolve(cwd, cli.input[1]);
      const outputDir = cli.input[2] && resolve(cwd, cli.input[2]);
      if (!inputDir || !outputDir) {
        // only complain if other options are given. this makes apollo work like "apollo --help"
        // when run with no arguments
        if (process.argv.slice(2).length) {
          if (!inputDir) console.error("Missing input directory");
          if (!outputDir) console.error("Missing output directory");
        }

        return cli.showHelp(2);
      }

      const inputExists = inputDir && fs.existsSync(inputDir);
      if (!inputExists) {
        console.error(`Input directory does not exist`);
        process.exit(1);
      }

      const minSize = cli.flags.minSize ? xbytes.parseBytes(cli.flags.minSize).bytes : 0;
      const options: RenameOptions = {
        dryRun: cli.flags.dryRun,
        inputDirectory: inputDir,
        outputDirectory: outputDir,
        minSize: minSize,
        mode: cli.input[0] === "move" ? ApolloMode.Move : ApolloMode.Symlink,
        useSnapshots: cli.flags.snapshot,
        strategy: resolveStrategy(cli.flags.strategy),
        providers: resolveProviders(cli.flags.providers),
        detectSubtitleLanguage: cli.flags.detectSubtitleLanguage,
        formats: {
          episode: cli.flags.episodeFormat,
          movie: cli.flags.movieFormat,
        },
      };

      if (options.mode === ApolloMode.Symlink) {
        const hasSymlinkPermissions = process.platform === "win32" ? await isAdmin() : true;
        if (!hasSymlinkPermissions) {
          console.error(`Administrator privileges are required to use symlinks on Windows.`);
          process.exit(1);
        }
      }

      await renameFiles(options);
      break;
    }
    case "rollback": {
      const inputDir = cli.input[1] && resolve(cwd, cli.input[1]);
      const inputExists = inputDir && fs.existsSync(inputDir);
      if (!inputExists) {
        console.error(`Input directory does not exist`);
        process.exit(1);
      }

      const rolledBack = await rollback(inputDir);
      if (rolledBack === 0) {
        console.log(`No files rolled back`);
        break;
      }

      console.log(
        `${rolledBack.toLocaleString()} files rolled back from the last batch. There may be more files to roll back from other invocations.`
      );
      break;
    }
    case "parse": {
      const inputData = cli.input.slice(1).join(" ");
      if (!inputData) {
        throw cli.showHelp(1);
      }

      const parser = new ApolloParser({
        providers: resolveProviders(cli.flags.providers),
        detectSubtitleLanguage: cli.flags.detectSubtitleLanguage,
      });

      const result = await parser.parse(inputData);
      if (!result) {
        console.log("No matches found");
        break;
      }

      const colorised = coloriseResult(inputData, result, parser);
      console.log(colorised);
      break;
    }
    default:
      cli.showHelp(2);
  }
}

main();
