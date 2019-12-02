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
`,
  {
    flags: {
      // move: {
      //   type: 'boolean',
      //   alias: ['m', 'M'],
      //   default: false
      // },
      debug: {
        type: 'boolean',
        alias: ['d', 'D'],
        default: false
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
    move: cli.flags.move
  });

  await apollo.run();
  log.info(`Imported files from "${input}" to "${output}"`);
}

main();
