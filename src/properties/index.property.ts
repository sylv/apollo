import { ApolloParser } from "../classes/apollo-parser";
import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";
import { Property } from "./property";

const INDEX_PATTERNS = [
  // "(24)"
  new RegExp(`${PART_START_PATTERN}\\((?<index>[0-9]{1,4})\\)${PART_END_PATTERN}`, "g"),
  // "32 - ", "32_"
  new RegExp(`(?<=^|\\/)(?<index>[0-9]{1,4})( ?-|_)`, "g"),
  // "title_32.mp4", "title_32"
  new RegExp(`(_|- ?)(?<index>[0-9]{1,4})(?=$|\\.[a-z]{2,4})`, "g"),
];

export class PropertyIndex extends Property<"index"> {
  readonly key = "index";

  extract(cleanPath: string, parser: ApolloParser) {
    for (const pattern of INDEX_PATTERNS) {
      const match = parser.getMatch(cleanPath, pattern, false, false);
      if (!match) continue;
      const index = +match.groups!.index;
      if (isNaN(index)) continue;
      if (index === 0) continue;
      if (index > 1950 && index < new Date().getFullYear() + 2) {
        // probably an incorrectly matched year
        continue;
      }

      return index;
    }
  }
}
