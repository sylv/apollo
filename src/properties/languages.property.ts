import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";
import { ApolloParser } from "../classes/apollo-parser";
import { Property } from "./property";

const LANGUAGES_PATTERN = `${PART_START_PATTERN}-?(ITA|ENG|RUS|Hindi|English|Italian|en-[a-z]{2})-?${PART_END_PATTERN}`;
const LANGUAGES_REGEX = new RegExp(LANGUAGES_PATTERN, "g");

export class PropertyLanguages extends Property<"languages"> {
  readonly key = "languages";

  extract(cleanPath: string, parser: ApolloParser) {
    return parser.getMatch(cleanPath, LANGUAGES_REGEX, true).map((match) => match[1]);
  }
}
