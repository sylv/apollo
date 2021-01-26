import { IMDBTitleType } from "@ryanke/imdb-api";

export namespace apollo {
  export enum FileType {
    MEDIA = "MEDIA",
    SUPPORTING = "SUPPORTING",
  }

  export interface Match {
    value: string;
    index: number;
  }

  export interface Options {
    input: string;
    output: string;
    move: boolean;
    dryRun: boolean;
    minSize: number;
    disableLookup: boolean;
  }

  export interface Parsed {
    title: string;
    resolution?: number;
    type: IMDBTitleType;
    fileType: FileType;
    collection: boolean;
    seasonNumber?: number;
    episodeNumber: number[];
    extension: string;
    startYear?: number;
    endYear?: number;
    languages: string[];
    audio: string[];
  }

  export interface ParserOptions {
    /**
     * Whether to query IMDb for more accurate title information. Disabling will result in less accurate "title" data.
     * IMDb queries are usually fast (<100ms for most people, even those outside the US) and are cached.
     */
    disableLookup?: boolean;
  }
}
