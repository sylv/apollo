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
  /** The clean name of the file. For tv shows/movies, this should be the movie name. */
  name?: string;
  titleType?: TitleType;
  fileType: FileType;
  /** Whether the input is a collection. Files parsed that are a part of a collection will have this as false. */
  collection: boolean;
  /** The IMDb ID of the episode, if resolved. */
  episodeId?: string;
  episodeName?: string;
  /** The season number the file itself is in */
  seasonNumber?: number;
  /** The episode number of the file itself, for multi-episode files there may be multiple */
  episodeNumber?: number[];
  /** For collections, the seasons in the collection */
  seasons?: number[];
  /** For episodes, the episodes in the collection */
  episodes?: number[];
  /** The file extension */
  extension: string;
  /**
   * The start year.
   * For movies, this is the year it was released.
   */
  startYear?: number;
  /** The end year, only for tv series. */
  endYear?: number;
  languages: string[];
  audio: string[];
  coding: string[];
  quality?: Quality;
  date?: Date;
  /** The index of the file/photo, for example 1 in "1-My File.mp4" */
  index?: number;
  imdbId?: string;
  /** The poster for the series or movie */
  poster?: string;
  contentRating?: string;
  /** The release group for the torrent */
  releaseGroup?: string;
  /** IDs extracted from the name with links to them */
  links?: { name: string; id: string; url?: string }[];
  resolution?: ApolloOutputResolution;
}

export interface ApolloOutputResolution {
  height: number | null;
  width: number | null;
}
