import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";
import { ApolloParser } from "../classes/apollo-parser";
import { Property } from "./property";

const COLLECTION_PATTERN = `${PART_START_PATTERN}complete|completa|collection|trilogy|duology|(?:season|se|s) ?[0-9]{1,2} ?- ?(?:season|se|s)?[0-9]{1,2}${PART_END_PATTERN}`;
const COLLECTION_REGEX = new RegExp(COLLECTION_PATTERN, "gi");

export class PropertyCollection extends Property<"collection"> {
  readonly key = "collection";

  extract(cleanPath: string, parser: ApolloParser) {
    const match = parser.getMatch(cleanPath, COLLECTION_REGEX, false);
    return !!match;
  }
}
