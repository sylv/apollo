import mem from "mem";
import fetch from "node-fetch";
import { apollo } from "../types";
import { SERIES_ALIASES } from "../constants";

export interface IMDbResult {
  d?: IMDbResultItem[];
  q: string;
  v: number;
}

export interface IMDbResultItem {
  i?: Image;
  id: string;
  l: string;
  q?: string;
  rank: number;
  v?: Video[];
  vt?: number;
  y?: number;
  yr?: string;
}

export interface Image {
  height: number;
  imageUrl: string;
  width: number;
}

export interface Video {
  i: Image;
  id: string;
  l: string;
  s: string;
}

function resolveType(raw?: string): apollo.TitleType | void {
  if (raw === "feature") return apollo.TitleType.MOVIE;
  if (raw === "TV series") return apollo.TitleType.TV;
}

// todo: save cache to disk
export const lookup = mem(
  async (input: string): Promise<apollo.LookupResult[]> => {
    for (const alias of SERIES_ALIASES) {
      const match = input.match(alias.pattern);
      if (match) input = alias.title;
    }

    const query = input
      .replace(/[^A-z0-9- ]/g, "")
      .split(/-| /g)
      .join("_")
      .toLowerCase();

    if (!query) return [];
    const firstChar = query.charAt(0);
    const url = `https://v2.sg.media-imdb.com/suggestion/${firstChar}/${query}.json`;
    const json: IMDbResult = await fetch(url).then(r => r.status === 200 && r.json());
    if (!json || !json.d) {
      return [];
    }

    return json.d
      .map<apollo.LookupResult | undefined>(item => {
        const type = resolveType(item.q);
        if (type === undefined) return;

        return {
          title: item.l,
          year: item.y,
          rank: item.rank,
          poster: item.i ? item.i.imageUrl : undefined,
          type
        };
      })
      .filter(Boolean) as apollo.LookupResult[];
  }
);
