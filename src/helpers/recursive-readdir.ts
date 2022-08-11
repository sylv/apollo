import { opendir, readdir } from "fs/promises";
import { join } from "path";
import { log } from "../log";

export async function* recursiveReaddir(input: string): AsyncGenerator<string> {
  if (process.env.NODE_ENV === "test") {
    // memfs doesnt support opendir(), so we use readdir() as a workaround for tests
    // todo: this is a hacky workaround, tests should not use different code
    const files = await readdir(input, { withFileTypes: true });
    for (const file of files) {
      const path = join(input, file.name);
      if (file.isDirectory()) {
        yield* recursiveReaddir(path);
      } else if (file.isFile()) {
        yield path;
      } else {
        log.debug(`Skipping "${path}" as it is not a file or directory`);
      }
    }

    return;
  }

  // use opendir() normally it uses streaming and can handle large directories better, in theory
  const handle = await opendir(input, { bufferSize: 100 });
  for await (const entry of handle) {
    const path = join(input, entry.name);
    if (entry.isFile()) {
      yield path;
    } else if (entry.isDirectory()) {
      yield* recursiveReaddir(path);
    } else {
      log.debug(`Skipping "${path}" as it is not a file or directory`);
    }
  }
}
