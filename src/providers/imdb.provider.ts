import fetch from "node-fetch";
import { parseType } from "../helpers/parse-type";
import { registerProvider, SearchResult } from "./store";

export interface SearchBody {
  /** search results */
  d?: SearchBodyResult[];
  /** query as perceived by the server */
  q: string;
  v: number;
}

export interface SearchBodyResult {
  /** cover image */
  i?: SearchBodyResultImage;
  id: string;
  /** name */
  l: string;
  /** type */
  q: string;
  rank: number;
  /** people involved */
  s: string;
  /** media */
  v?: SearchBodyResultMedia[];
  vt?: number;
  /** start year */
  y: number;
  /** year range */
  yr?: string;
}

export interface SearchBodyResultImage {
  imageUrl: string;
  height: number;
  width: number;
}

export interface SearchBodyResultMedia {
  /** thumbnail */
  i: SearchBodyResultImage;
  id: string;
  /** name */
  l: string;
  /** duration */
  s: string;
}

async function getBody(stripped: string) {
  const firstChar = stripped[0];
  const url = `https://v2.sg.media-imdb.com/suggestion/${firstChar}/${stripped}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status >= 500) throw new Error(response.statusText);
    return [];
  }

  const body: SearchBody = await response.json();
  return body.d;
}

registerProvider("imdb", {
  search: async (searchTerm) => {
    const stripped = searchTerm.replace(/ /g, "_");
    const rawItems = await getBody(stripped);
    if (!rawItems) return [];

    const cleanedItems: SearchResult[] = [];
    for (const result of rawItems) {
      if (!result.q) continue;
      const type = parseType(result.q);
      if (type === undefined) continue;
      cleanedItems.push({
        imdbId: result.id,
        name: result.l,
        startYear: result.y,
        endYear: null,
        type: type,
        poster: result.i?.imageUrl,
      });
    }

    return cleanedItems;
  },
});
