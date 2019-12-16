import { Logger } from './logger';
import { ParsedName } from './parser/types';
import rrdir = require('rrdir');

export interface ApolloOptions {
  input: string;
  output: string;
  debug: boolean;
  logger: Logger;
  minSize: number;
}

export interface File extends rrdir.Entry {
  fileName: string;
  directoryPath: string;
  /** used for comparisons with supporting files */
  strippedName: string;
  strippedParentDirectory: string;
}

export interface ParsedFile {
  main: File;
  parsed: ParsedName;
}

export interface GroupedFile extends ParsedFile {
  files: File[];
}
