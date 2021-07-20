import { IMDBTitlePartial, IMDBTitleType } from "@ryanke/imdb-api";
import { Logger } from "tslog";

export enum FileType {
  MEDIA = "MEDIA",
  SUBTITLE = "SUBTITLE",
}

export namespace apollo {
  export interface Options extends ParserOptions {
    input: string;
    output: string;
    move: boolean;
    dryRun: boolean;
    minSize: number;
  }

  export interface ParserOptions {
    logger?: Logger;
    disableLookup?: boolean;
  }

  export interface Resolution {
    height?: number;
    width?: number;
  }

  export interface Parsed {
    title?: string;
    type?: IMDBTitleType;
    fileType: FileType;
    collection: boolean;
    seasonNumber?: number;
    episodeNumber?: number[];
    seasons?: number[];
    episodes?: number[];
    extension: string;
    startYear?: number;
    endYear?: number;
    languages: string[];
    audio: string[];
    coding: string[];
    quality?: string;
    date?: Date;
    imdb?: IMDBTitlePartial;
    resolution?: Resolution;
  }
}
