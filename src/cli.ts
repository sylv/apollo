import meow = require("meow");
import path = require("path");
// import fs = require("fs");
import signale from "signale";
import pathExists from "path-exists";
import { Apollo } from "./";

const log = signale.scope("cli");
const cli = meow(
  `
    Usage
      parcel-cli <input-directory> <output-directory>
    Example
      parcel-cli ./torrents ./clean
      parcel-cli ./torrents/**/*.mkv ./clean
      parcel-cli D:\\Torrents E:\\Media
    Options
      --debug, -D Enable development logging
      --min-size, --minSize The minimum size of a media file in bytes to be considered valid. Defaults to 25,000,000 (25Mb)
`,
  {
    flags: {
      debug: {
        type: "boolean",
        default: false
      },
      minSize: {
        default: 25000000,
        alias: "min-size"
      }
    }
  }
);

async function main() {
  const [rawInput, rawOutput] = cli.input;
  const cwd = process.cwd();
  const input = rawInput && path.resolve(cwd, rawInput);
  const output = rawOutput && input && path.resolve(cwd, rawOutput);

  const exit = (err: any) => {
    log.error(err);
    process.exit(1);
  };

  process.on("unhandledRejection", exit);
  process.on("uncaughtException", exit);

  if (!input || !output) {
    if (!input) {
      log.error("Missing input directory");
    }

    if (!output) {
      log.error("Missing output directory");
    }

    cli.showHelp();
    process.exit(1);
  }

  const inputExists = await pathExists(input);
  const outputExists = await pathExists(output);
  if (!inputExists) {
    log.error(`Input directory does not exist`);
    process.exit(1);
  }

  if (!outputExists) {
    // await fs.promises.mkdir(output, { recursive: true });
  }

  const apollo = new Apollo({
    input,
    output,
    debug: cli.flags.debug,
    minSize: cli.flags.minSize as number
  });

  await apollo.run();
}

main();
