import { createHash } from "crypto";
import memoize from "memoizee";
import { performance } from "perf_hooks";
import scrapeIt from "scrape-it";
import { DiskCache } from "../helpers/disk-cache";
import { log } from "../log";
import { stripImageSize } from "./helpers/strip-image-size";

interface Episode {
  id: string;
  name?: string;
  description?: string;
  poster?: string;
  episodeNumber: number;
  releaseDate: Date;
}

const EPISODE_REGEX = /S[0-9]{1,3}, Ep(?<episodeNumber>[0-9]{1,4})/i;
const GENERIC_NAME_REGEX = /^(Episode) #?[0-9]+/i;
const cache = new DiskCache<Episode[]>("episodes", "12h");

const getSeasonEpisodes = memoize(async (titleId: string, seasonNumber: number): Promise<Episode[]> => {
  const cacheKey = createHash("sha256").update(JSON.stringify({ titleId, seasonNumber })).digest("hex");
  const cached = await cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const start = performance.now();
  const url = `https://www.imdb.com/title/${titleId}/episodes/_ajax?season=${seasonNumber}`;
  const result = await scrapeIt<{ episodes: Episode[] }>(url, {
    episodes: {
      listItem: ".list_item",
      data: {
        id: { selector: "div[data-tconst]", attr: "data-tconst" },
        description: {
          selector: ".item_description",
          convert: (text) => {
            if (text.includes("Know what this is about")) return;
            return text;
          },
        },
        name: {
          selector: "a[itemprop=name]",
          convert: (name: string) => {
            if (GENERIC_NAME_REGEX.test(name)) return;
            return name;
          },
        },
        poster: {
          selector: "img",
          attr: "src",
          convert: (src) => stripImageSize(src),
        },
        episodeNumber: {
          selector: `.hover-over-image div:contains("S${seasonNumber}")`,
          convert: (text) => {
            const match = EPISODE_REGEX.exec(text);
            if (!match) return null;
            return Number(match.groups!.episodeNumber);
          },
        },
        releaseDate: {
          selector: ".airdate",
          convert: (text) => new Date(text),
        },
      },
    },
  });

  await cache.set(cacheKey, result.data.episodes);
  const end = performance.now();
  log.debug(`getSeasonEpisodes(${titleId}, ${seasonNumber}) took ${end - start}ms`);
  return result.data.episodes;
});

export const getEpisode = async (titleId: string, seasonNumber: number, episodeNumber: number) => {
  const seasonEpisodes = await getSeasonEpisodes(titleId, seasonNumber);
  return seasonEpisodes.find((episode) => episode.episodeNumber === episodeNumber);
};
