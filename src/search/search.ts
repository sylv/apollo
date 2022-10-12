import mem from "memoizee";
import fetch from "node-fetch";
import { parseType } from "../helpers/parse-type";
import { log } from "../log";
import { TitleType } from "../types";
import { formatSearchQuery } from "./helpers/format-search-query";
import { IMDBSearchResultPage, QueryOptions, SearchResult } from "./types";

export const search = mem(async (query: QueryOptions) => {
  if (query.type === TitleType.EPISODE) query.type = TitleType.SERIES;
  if (query.imdbId) {
    // todo: this is a hack, currently both providers support this but in the future we should
    // have a distrinct lookup method for each provider that handles it.
    query.name = query.imdbId;
  }

  const searchTerm = (formatSearchQuery(query.name.toLowerCase()) || query.name).trim();

  log.debug(`Searching "${searchTerm}"`);
  const url = `https://v3.sg.media-imdb.com/suggestion/x/${searchTerm}.json`;
  console.log({ url });
  const response = await fetch(url);
  if (!response.ok) {
    log.warn(`Failed to search for "${searchTerm}", ${response.status} ${response.statusText}`);
    return;
  }

  const json = (await response.json()) as IMDBSearchResultPage;
  for (const result of json.d) {
    if (!result.qid) continue;
    const [startYear, endYear] = result.yr ? result.yr.split("-").map(Number) : [result.y || null, null];
    const type = parseType(result.qid);
    if (type === undefined) {
      log.warn(`Unknown type "${result.q}" for "${result.l}"`);
      continue;
    }

    if (type !== query.type) continue;
    if (query.imdbId && query.imdbId !== result.id) continue;
    if (query.type === TitleType.MOVIE && query.startYear && query.startYear !== startYear) {
      // for movies we can just assume that the year not matching means its not the right movie
      continue;
    } else if (query.type === TitleType.SERIES) {
      // if the start/end year of the result are not within the query range, its not a good match.
      // this works for torrents that have the year as "2008" but the series is 2005-2015 or something.
      // +- 1 because sometimes imdb or the torrent is off by a year.
      if (startYear && query.startYear && query.startYear < startYear - 1) continue;
      if (endYear && query.endYear && query.endYear > endYear + 1) continue;
    }

    // imdb tends to return random results with extremely long names
    // when it has no clue what you're after. this avoids those results.
    // its *3 because *2 might not match "the fellowship of the ring" to "the lord of the rings: the fellowship of the ring"
    if (result.l.length > searchTerm.length * 3) {
      continue;
    }

    const formatted: SearchResult = {
      name: result.l,
      imdbId: result.id,
      type: type,
      startYear: startYear,
      endYear: endYear,
      poster: result.i?.imageUrl,
    };

    return formatted;
  }
});
