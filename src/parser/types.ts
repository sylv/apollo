export interface BaseSchemaItem {
  regex: RegExp;
}

export interface CustomSchemaItem extends BaseSchemaItem {
  extract: (match: RegExpExecArray) => any;
}

export interface AutoSchemaItem extends BaseSchemaItem {
  index: number | number[];
  number?: boolean;
  replace?: boolean;
}

export interface Schema {
  [key: string]: AutoSchemaItem | CustomSchemaItem;
}

export interface ParsedSchema<T> {
  firstMatchIndex: number | undefined;
  replacedInput: string;
  resolved: Partial<T>;
  matches: {
    [key: string]: RegExpExecArray | undefined;
  };
}

export interface ParsedName {
  title?: string;
  type: FileType;
  extension?: string | undefined;
  audio?: string | undefined;
  resolution?: number | undefined;
  year?: number | undefined;
  codec?: string | undefined;
  language?: string[] | undefined;
  seasonNumber?: number | undefined;
  episodeNumber?: number | undefined;
  episodeName?: string | undefined;
  excess?: string[];
}

export enum FileType {
  // EPISODE,
  // MOVIE
  // make it easier when reading output json
  EPISODE = 'Episode',
  MOVIE = 'Movie'
}
