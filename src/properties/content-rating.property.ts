import { ApolloParser } from "../classes/apollo-parser";
import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";
import { Property } from "./property";

const RATINGS: string[] = ["PG", "TV-1", "TV-MA", "TV-PG", "TV-14", "TV-G", "TV-Y", "TV-Y7", "R18", "PG-13", "MA"];

const CONTENT_RATING_PATTERN = `${PART_START_PATTERN}(${RATINGS.join("|")})${PART_END_PATTERN}`;
const CONTENT_RATING_REGEX = new RegExp(CONTENT_RATING_PATTERN, "g"); // case-sensitive on purpose

export class PropertyContentRating extends Property<"contentRating"> {
  readonly key = "contentRating";

  extract(cleanPath: string, parser: ApolloParser) {
    const match = parser.getMatch(cleanPath, CONTENT_RATING_REGEX, false);
    if (match) return match[0];
  }
}
