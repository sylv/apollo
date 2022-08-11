import { createHash } from "crypto";
import LRU from "lru-cache";
import { getStrippedDistance } from "../helpers/get-stripped-distance";
import { log } from "../log";
import { TitleType } from "../types";
import { formatSearchQuery } from "./helpers/format-search-query";
import { COUNTRY_REGEX, getCountry } from "./helpers/get-country";

export interface ProviderEpisode {
  episodeId: string;
  episodeName: string;
}

export type Provider = {
  search: (input: string) => Promise<SearchResult[]>;
  getEpisode?: (parentId: string, seasonNumber: number, episodeNumber: number) => Promise<ProviderEpisode | null>;
};

export interface SearchResult {
  imdbId: string;
  type: TitleType;
  name: string;
  startYear: number | null;
  endYear: number | null;
  poster?: string;
}

export const providers = new Map<string, Provider>();
export const registerProvider = (name: string, provider: Provider) => {
  providers.set(name, provider);
};

const cache = new LRU<string, SearchResult>({
  max: 1000,
  allowStale: true,
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

interface QueryOptions {
  name: string;
  type: TitleType;
  imdbId?: string;
  year?: number;
}

export const search = async (providerNames: string[], query: QueryOptions) => {
  if (query.type === TitleType.EPISODE) query.type = TitleType.SERIES;
  if (query.imdbId) {
    // todo: this is a hack, currently both providers support this but in the future we should
    // have a distrinct lookup method for each provider that handles it.
    query.name = query.imdbId;
  }

  const cacheKey = createHash("sha256").update(JSON.stringify(query)).digest("hex");
  const cached = cache.get(cacheKey);
  if (cached) {
    log.debug(`Cache hit for "${query.name}" (id=${cached.imdbId},cacheKey=${cacheKey},name=${cached.name})`);
    return cached;
  }

  // removing the country code and filtering by it later seems to be a better option,
  // otherwise things like "the simpsons au" wont match "The Simpsons Australia"
  const countryCode = getCountry(query.name); // query.name is intentional for capitalisation if necessary
  const searchTerm = (formatSearchQuery(query.name.toLowerCase()) || query.name).replace(COUNTRY_REGEX, "").trim();

  for (const providerName of providerNames) {
    const provider = providers.get(providerName);
    if (!provider) {
      log.warn(`Unknown provider "${providerName}"`);
      continue;
    }

    log.debug(`Searching "${searchTerm}" on ${providerName}`);
    const results = await provider.search(searchTerm);
    const filtered = results
      .filter((result) => {
        if (result.type !== query.type) return false;
        if (query.imdbId && result.imdbId !== query.imdbId) return false;
        if (query.type === TitleType.MOVIE && query.year && result.startYear && result.startYear !== query.year) {
          return false;
        } else if (query.type === TitleType.SERIES) {
          // with series, the year is sometimes the year of the season so we need to check if the year is
          // within the range instead, which is a lot more "fuzzy" but more correct.
          // todo: we might be able to rely on series years if we ensure the year comes from the part of the path
          // with the series name, for example only trust 2009 in "Archer (2009)/Season 2 (2011)"
          if (query.year && result.startYear && result.startYear > query.year) return false;
          if (query.year && result.endYear && result.endYear < query.year) return false;
        }

        // imdb tends to return random results with extremely long names
        // when it has no clue what you're after. this avoids those results.
        // its *3 because *2 might not match "the fellowship of the ring" to "the lord of the rings: the fellowship of the ring"
        if (result.name.length > searchTerm.length * 3) {
          return false;
        }

        return true;
      })
      .map((result) => {
        let rank = 0;
        if (result.startYear === query.year) rank += 1;
        if (result.endYear === query.year) rank += 1;
        if (result.startYear && query.year) {
          // add a couple points the closer to the start/end year we are, up to a max of "maxYears" years
          // should help a bit for shows with reboots, etc that havent ended yet
          const maxYears = 10;
          const distanceToStart = Math.abs(query.year - result.startYear);
          const distanceToEnd = result.endYear ? Math.abs(query.year - result.endYear) : null;
          const shortest = distanceToEnd ? Math.min(distanceToStart, distanceToEnd) : distanceToStart;
          rank += Math.max((maxYears - shortest) / 10, 0);
        }

        if (countryCode) {
          // prioritise "top gear uk" or "top gear" for "top gear uk" over "top gear usa"
          // "top gear usa" is closer to "top gear uk" then "top gear" using leven, so this works around it
          const resultCountry = getCountry(result.name);
          if (resultCountry === countryCode) rank += 10;
          if (resultCountry && !countryCode) rank -= 0.5;
          if (resultCountry && resultCountry !== countryCode) {
            // punish for having a country not matching countryCode
            // not punished for having no country while input does
            // because "top gear uk" would not match "top gear" when it should
            rank -= 10;
          }
        }

        const distance = getStrippedDistance(searchTerm, result.name.replace(COUNTRY_REGEX, "").trim().toLowerCase());
        rank -= distance / 2;

        // with single-word titles, i've found IMDb struggles sometimes,
        // for example returning "Logan Lucky (2017)" before "Logan (2017)". This is a hacky way
        // to get around that.
        if (query.name.toLowerCase() === result.name.toLowerCase()) {
          rank += 5;
        }

        return { result, rank };
      })
      .sort((a, b) => b.rank - a.rank);

    const best = filtered[0];
    if (best) {
      if (filtered[1]) {
        log.debug(
          `Picked "${best.result.name}/${best.result.imdbId}" over ${filtered.length - 1} others`,
          filtered.map(({ result, rank }) => ({
            name: result.name,
            startYear: result.startYear,
            imdbId: result.imdbId,
            rank: rank,
          }))
        );
      }

      cache.set(cacheKey, best.result);
      return best.result;
    }
  }
};

export const getEpisode = async (providerNames: string[], parentId: string, seasonNumber: number, episodeNumber: number) => {
  // no caching because we should only be doing this once
  for (const providerName of providerNames) {
    const provider = providers.get(providerName);
    if (!provider) {
      log.warn(`Unknown provider "${providerName}"`);
      continue;
    }

    if (!provider.getEpisode) continue;
    log.debug(`Getting episode S${seasonNumber}E${episodeNumber} on ${providerName} for ${parentId}`);
    const result = await provider.getEpisode(parentId, seasonNumber, episodeNumber);
    if (result) {
      return result;
    }
  }
};
