import { TitleType } from "../types";

const STRIP_REGEX = /[^A-z]+/g;
const TYPE_MAP = new Map<string, TitleType>([
  ["feature", TitleType.MOVIE],
  ["movie", TitleType.MOVIE],
  ["tvmovie", TitleType.MOVIE],
  ["tvseries", TitleType.SERIES],
  ["tvminiseries", TitleType.SERIES],
  ["series", TitleType.SERIES],
  ["tvshort", TitleType.SHORT],
  ["short", TitleType.SHORT],
  ["tvepisode", TitleType.EPISODE],
  ["episode", TitleType.EPISODE],
  ["video", TitleType.VIDEO],
]);

export function parseType(input: string) {
  const query = input.toLowerCase().replace(STRIP_REGEX, "").trim();
  return TYPE_MAP.get(query);
}
