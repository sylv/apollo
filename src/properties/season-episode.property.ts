import { Property } from "./property";
import { ApolloParser } from "../classes/apollo-parser";
import { PART_END_PATTERN, PART_START_PATTERN, SPACE_REGEX } from "../constants";
import { getAllMatches } from "../helpers/get-all-matches";
import { ApolloOutput } from "../types";

const SEASON_EPISODE_PATTERNS = [
  // matches "1x1"
  // not "1x1t", "1x1-1x2"
  new RegExp(`${PART_START_PATTERN}(?<season>[0-9]{1,4})x(?<episode>[0-9]{1,2})${PART_END_PATTERN}`, "gi"),
  // matches "Season 1 Episode 02", "Season 01"
  new RegExp(`${PART_START_PATTERN}Season.(?<season>[0-9]{1,4})(?:.Episode.(?<episode>[0-9]{1,2}))?${PART_END_PATTERN}`, "gi"),
  // matches "SE1/01"
  new RegExp(`${PART_START_PATTERN}(?:SE|S)(?<season>[0-9]{1,4})\\/(?<episode>[0-9]{1,2})${PART_END_PATTERN}`, "gi"),
  // matches "SE01E01", "S01E01", "S01 E01", "S01"
  // not "Se7en" or "S01e01-10"
  new RegExp(`${PART_START_PATTERN}(?:SE|S)(?<season>[0-9]{1,4})${SPACE_REGEX}?(?<episode>(?:(?:EP|E)[0-9]{1,2})+)?${PART_END_PATTERN}`, "gi"),
  // matches "Part 3 of 3" if we're really desparate
  new RegExp(`${PART_START_PATTERN}Part (?<episode>[0-9]) of [0-9]${PART_END_PATTERN}`, "gi"),
];

export class PropertySeasonEpisode extends Property<"episodes" | "seasons"> {
  write(cleanPath: string, parsed: Partial<ApolloOutput>, parser: ApolloParser) {
    let seasonNumber: number | undefined;
    let episodes: number[] = [];

    for (const pattern of SEASON_EPISODE_PATTERNS) {
      const matches = parser.getMatch(cleanPath, pattern, true);
      for (const match of matches) {
        if (!match.groups) continue;

        // if the char at the start or end of the match is a dash,
        // it indicates a season range that PropertySeason.ts will match,
        // so we want to throw out those matches entirely.
        const endIndex = match.index + match[0].length;
        const charAfterMatch = cleanPath[endIndex];
        const charBeforeMatch = cleanPath[match.index - 1];
        if (charAfterMatch === "-" || charBeforeMatch === "-") continue;

        const seasonMatch = this.resolve(match.groups.season);
        const episodeMatch = this.resolve(match.groups.episode);
        if (seasonMatch !== undefined && episodeMatch !== undefined) {
          // if we have both, trust it more than separate parts we got.
          // e.g, "Season 1\S02E02", this should give us S02E02 instead of S01E02
          seasonNumber = seasonMatch[0];
          episodes = episodeMatch;
          break;
        }

        if (seasonMatch !== undefined && !seasonNumber) seasonNumber = seasonMatch[0];
        if (episodeMatch !== undefined && !episodes.length) episodes = episodeMatch;
      }
    }

    if (seasonNumber) parsed.seasonNumber = seasonNumber;
    if (episodes.length) parsed.episodeNumber = episodes;
    return parsed;
  }

  private resolve(match?: string) {
    if (!match) return;
    const matches = getAllMatches(match, /[0-9]+/g);
    const parsed = matches.map((match) => parseInt(match[0], 10)).filter((value) => !isNaN(value));
    if (parsed[0] === undefined) return;
    return parsed;
  }
}
