import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";
import { ApolloParser } from "../classes/ApolloParser";
import { Property } from "./Property";

const PROPERTY_PATTERN = `${PART_START_PATTERN}([0-9]{3,4})(?:p)${PART_END_PATTERN}`;
const PROPERTY_REGEX = new RegExp(PROPERTY_PATTERN, "gi");

export class PropertyResolution extends Property<"resolution"> {
  readonly key = "resolution";

  extract(cleanPath: string, parser: ApolloParser) {
    const match = parser.getMatch(cleanPath, PROPERTY_REGEX, false);
    if (!match) return;
    return +match[1];
  }
}
