import ISO6391 from "iso-639-1";
import { ApolloParser } from "../classes/apollo-parser";
import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";
import { Property } from "./property";

const LANGUAGE_PATTERNS = [
  // match less obvious codes like "ITA" and "en"
  new RegExp(`${PART_START_PATTERN}-?(?<lang>ITA|ENG|RUS|en-[a-z]{2})-?${PART_END_PATTERN}`, "g"),
  // match obvious language names like "english", "french"
  /\b(?<lang>English|French|Italian|Hindi)\b/gi,
  // match subtitle languages like "My File.en.srt"
  /\.(?<lang>[a-z]{2})\.srt/gi,
];

export class PropertyLanguages extends Property<"languages"> {
  readonly key = "languages";

  extract(cleanPath: string, parser: ApolloParser) {
    return LANGUAGE_PATTERNS.flatMap((pattern) => parser.getMatch(cleanPath, pattern, true)).map((match) => {
      const lang = match.groups!.lang;
      return ISO6391.getCode(lang) || lang;
    });
  }
}
