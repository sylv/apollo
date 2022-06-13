import { search, SearchResult, TitleType } from "@ryanke/imdb-api";
import { Quality } from "./data/qualities.data";
import { IdType } from "./properties/ids.property";

export enum FileType {
  Video = "VIDEO",
  Image = "IMAGE",
  Subtitle = "SUBTITLE",
}

export interface ApolloOptions extends ApolloParserOptions {
  input: string;
  output: string;
  move: boolean;
  dryRun: boolean;
  minSize: number;
}

export interface ApolloParserOptions {
  disableLookup?: boolean;
  searchMethod?: typeof search;
  logger?: ApolloLogger;
}

export interface ApolloLogger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export interface ApolloOutput {
  title?: string;
  titleType?: TitleType;
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
  quality?: Quality;
  date?: Date;
  imdb?: SearchResult;
  index?: number;
  ids?: { type: IdType; id: string }[];
  resolution?: ApolloOutputResolution;
}

export interface ApolloOutputResolution {
  height: number | null;
  width: number | null;
}
