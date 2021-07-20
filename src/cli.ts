import meow from "meow";
import path from "path";
import fs from "fs";
import isAdmin from "is-admin";
import { Apollo } from "./classes/apollo";
import { Logger } from "tslog";

const cli = meow(
  `
    Usage
      apollo <input-directory> <output-directory>
    Example
      apollo ./torrents ./clean
      apollo ./torrents/**/*.mkv ./clean
      apollo D:\\Torrents E:\\Media
    Options
      --debug Enable development logging
      --move Move files instead of using symlinks. 
      --min-size The minimum size of a media file in bytes to be considered valid. Defaults to 25,000,000 (25Mb)
      --dry-run Skip file moves or symlink creations. In conjunction with --debug, this is good for testing.
      --disable-lookup Skip querying IMDb for more accurate title information. This would also allow Apollo to work without an internet connection.
`,
  {
    flags: {
      debug: {
        default: false,
        type: "boolean",
      },
      minSize: {
        default: 25000000,
        alias: "min-size",
        type: "number",
      },
      dryRun: {
        default: false,
        type: "boolean",
        alias: "dry-run",
      },
      move: {
        type: "boolean",
        default: false,
      },
      disableLookup: {
        type: "boolean",
        default: false,
      },
    },
  }
);

async function main() {
  const [rawInput, rawOutput] = cli.input;
  const cwd = process.cwd();
  const inputDir = rawInput && path.resolve(cwd, rawInput);
  const outputDir = rawOutput && inputDir && path.resolve(cwd, rawOutput);
  const hasSufficientPermissions = process.platform === "win32" ? await isAdmin() : true;
  const inputExists = inputDir && fs.existsSync(inputDir);
  const logLevel = cli.flags.debug ? "debug" : "info";
  const log = new Logger({ minLevel: logLevel });

  if (!inputDir || !outputDir) {
    // only complain if other options are given. this makes apollo work like "apollo --help"
    // when run with no arguments
    if (process.argv.slice(2).length) {
      if (!inputDir) log.error("Missing input directory");
      if (!outputDir) log.error("Missing output directory");
    }

    return cli.showHelp(2);
  }

  if (!inputExists) {
    log.error(`Input directory does not exist`);
    process.exit(1);
  }

  if (!hasSufficientPermissions && !cli.flags.move) {
    log.error(`Administrator privileges are required to use symlinks on Windows. Alternatively, try with --move.`);
    process.exit(1);
  }

  if (cli.flags.dryRun) {
    log.info(`--dry-run enabled`);
  }

  const apollo = new Apollo({
    logger: log,
    input: inputDir,
    output: outputDir,
    move: cli.flags.move,
    dryRun: cli.flags.dryRun,
    minSize: cli.flags.minSize,
    disableLookup: cli.flags.disableLookup,
  });

  await apollo.run();
}

main();
