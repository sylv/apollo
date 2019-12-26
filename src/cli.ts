import meow = require('meow');
import path = require('path');
import fs = require('fs');
import { Apollo } from './';
import { Logger } from './logger';
import { pathExists } from './helpers/pathExists';

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
        type: 'boolean',
        alias: ['d', 'D'],
        default: false
      },
      minSize: {
        default: 25000000,
        alias: ['min-size', 'minsize']
      }
    }
  }
);

async function main() {
  const log = new Logger(cli.flags.debug);
  const [rawInput, rawOutput] = cli.input;
  const cwd = process.cwd();
  const input = rawInput && path.resolve(cwd, rawInput);
  const output = rawOutput && input && path.resolve(cwd, rawOutput);

  if (!input || !output) {
    if (!input) {
      log.error('Missing input directory');
    }

    if (!output) {
      log.error('Missing output directory');
    }

    cli.showHelp();
    process.exit(1);
  }

  const inputExists = await pathExists(input);
  const outputExists = await pathExists(output);
  if (!inputExists) {
    log.throw(`Input directory does not exist`);
  }

  if (!outputExists) {
    await fs.promises.mkdir(output, { recursive: true });
  }

  const apollo = new Apollo({
    input,
    output,
    logger: log,
    debug: cli.flags.debug,
    minSize: cli.flags.minSize
  });

  await apollo.run();
}

main();
