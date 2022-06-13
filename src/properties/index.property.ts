import { ApolloParser } from "../classes/apollo-parser";
import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";
import { Property } from "./property";

const INDEX_REGEX = new RegExp(`${PART_START_PATTERN}\\((?<index>[0-9]{1,4})\\)${PART_END_PATTERN}`, "g");

export class PropertyIndex extends Property<"index"> {
  readonly key = "index";

  extract(cleanPath: string, parser: ApolloParser) {
    const match = parser.getMatch(cleanPath, INDEX_REGEX, false);
    if (!match) return;
    const index = +match.groups!.index;
    if (isNaN(index)) return;
    if (index === 0) return;
    if (index > 1950 && index < new Date().getFullYear() + 2) return;
    return index;
  }
}
