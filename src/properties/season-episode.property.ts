import { ApolloParser } from "../classes/apollo-parser";
import { parseRange } from "../helpers/parse-range";
import { ApolloOutput } from "../types";
import { Property } from "./property";

// patterns, in order of priority, lower = higher priority
// higher priority matches will overwrite lower priority matches.
const PATTERNS = [
  // "Part 3 of 3", if we're really desperate
  /Part (?<episodeNumber>[0-9]{1,2}) of (?<seasonNumber>[0-9]{1,2})/gi,
  // "some_title_ep03.mp4"
  /ep(?<episodeNumber>[0-9]{1,2})\b/gi,
  // "SE1/01"
  /SE?(?<seasonNumber>[0-9]{1,2})\/(?<episodeNumber>[0-9]{1,2})/gi,
  // "season 1", "season 1 episode 1", "season 1/episode 1"
  /Season (?<seasonNumber>[0-9]{1,2})(( |\/)Episode (?<episodeNumber>[0-9]{1,2}))?/gi,
  // "1x1", "1x12"
  /(\[|\(|\b)(?<seasonNumber>[0-9]{1,2})x(?<episodeNumber>[0-9]{1,2})(\]|\)|\b)/gi,
  // "S01E01", "S01 E02", "SE01EP01"
  /SE?(?<seasonNumber>[0-9]{1,3}) ?EP?(?<episodeNumber>[0-9]{1,3})/gi,
  // "episodes 1-4", "ep1-4"
  /\b(episodes?|ep|e) ?(?<episodeRangeExpand>[0-9-]{2,})\b/gi,
  // "season 1-4", "se1-4", "Seasons 1-7", "S01-S02"
  /\b(?:seasons|season|se|s) ?(?<seasonRangeExpand>[0-9]{1,2}(?:-S?[0-9]{1,2})+)/gi,
  // "S01E01E02", "S01E01-E02", "S01E01 - E02", "S01E01-02"
  /(?<=[0-9]|\b)EP?(?<episodeRange>[0-9]{1,2}(?:(?: ?- ?E?|E)[0-9]{1,2})+)/gi,
];

export class PropertySeasonEpisode extends Property<"episodeNumber" | "episodes" | "seasonNumber" | "seasons"> {
  write(cleanPath: string, parsed: Partial<ApolloOutput>, parser: ApolloParser) {
    const fileNameIndex = cleanPath.lastIndexOf("/");
    for (const pattern of PATTERNS) {
      const match = parser.getMatch(cleanPath, pattern, false);
      if (!match) continue;
      const matchIsInFileName = match.index > fileNameIndex;
      // console.log({ matchIsInFileName });

      // handle "seasonRange" and "seasonRangeExpand" groups
      // this becomes "seasons" if the match was before the file name and "seasonNumber"
      // if the match was in the file name.
      const seasonRange = match.groups!.seasonRange || match.groups!.seasonRangeExpand;
      const parsedSeasonRange = seasonRange && parseRange(seasonRange, !!match.groups!.seasonRangeExpand);
      if (parsedSeasonRange) {
        if (matchIsInFileName && parsedSeasonRange.length === 1) {
          parsed.seasonNumber = parsedSeasonRange[0];
        } else {
          parsed.seasons = parsedSeasonRange;
        }
      }

      // handle "episodeRange" and "episodeRangeExpand" groups
      // this becomes "episodes" if the match was before the file name and "episodeNumber"
      // if the match was in the file name.
      const episodeRange = match.groups!.episodeRange || match.groups!.episodeRangeExpand;
      const parsedEpisodeRange = episodeRange && parseRange(episodeRange, !!match.groups!.episodeRangeExpand);
      if (parsedEpisodeRange) {
        if (matchIsInFileName) parsed.episodeNumber = parsedEpisodeRange;
        else parsed.episodes = parsedEpisodeRange;
      }

      // handle "episodeNumber" group
      const episodeNumber = match.groups!.episodeNumber;
      if (episodeNumber) {
        const parsedEpisodeNumber = Number(episodeNumber);
        if (!isNaN(parsedEpisodeNumber)) {
          parsed.episodeNumber = [parsedEpisodeNumber];
        }
      }

      // handle "seasonNumber" group
      const seasonNumber = match.groups!.seasonNumber;
      if (seasonNumber) {
        const parsedSeasonNumber = Number(seasonNumber);
        if (!isNaN(parsedSeasonNumber)) {
          parsed.seasonNumber = parsedSeasonNumber;
        }
      }
    }

    return parsed;
  }
}
