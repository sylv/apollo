import { Quality } from "./data/qualities";

export enum TitleType {
  MOVIE,
  SERIES,
  SHORT,
  EPISODE,
  VIDEO,
}

export enum FileType {
  Video = "VIDEO",
  Image = "IMAGE",
  Subtitle = "SUBTITLE",
}

export interface ApolloOutput {
  name?: string;
  titleType?: TitleType;
  fileType: FileType;
  collection: boolean;
  episodeId?: string;
  episodeName?: string;
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
  index?: number;
  imdbId?: string;
  poster?: string;
  contentRating?: string;
  releaseGroup?: string;
  links?: { name: string; id: string; url?: string }[];
  resolution?: ApolloOutputResolution;
}

export interface ApolloOutputResolution {
  height: number | null;
  width: number | null;
}
