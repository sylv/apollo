import { TitleType } from "../types";

export interface QueryOptions {
  name: string;
  type: TitleType;
  imdbId?: string;
  startYear?: number;
  endYear?: number;
}

export interface SearchResult {
  imdbId: string;
  type: TitleType;
  name: string;
  startYear: number | null;
  endYear: number | null;
  poster?: string;
}

export interface IMDBSearchResultPage {
  d: IMDBSearchResult[];
  q: string;
  v: number;
}

export interface IMDBSearchResult {
  i?: IMDBImage;
  id: string;
  l: string;
  q?: string;
  qid?: string;
  rank: number;
  s: string;
  y?: number;
  yr?: string;
}

export interface IMDBImage {
  height: number;
  imageUrl: string;
  width: number;
}
