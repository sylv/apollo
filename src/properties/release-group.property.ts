import escape from "escape-string-regexp";
import { ApolloParser } from "../classes/apollo-parser";
import { RELEASE_GROUPS } from "../data/release-groups";
import { Property } from "./property";

// release groups like "YTS.AG" wont match clean paths because they become "YTS AG",
// so we let them match "YTS.AG" and "YTS AG" and restore the . in the parser
const RELEASE_GROUP_PATTERN_PART = RELEASE_GROUPS.map((item) => escape(item).replaceAll("\\.", "(\\.| )")).join("|");
const RELEASE_GROUP_PATTERNS = [
  // https://regex101.com/r/cenN69/1
  // match known release groups. a little more aggressive than normal
  new RegExp(`(?<=-|-\\[|\\[| )(?<name>${RELEASE_GROUP_PATTERN_PART})(?=\\]|$|\\/)`, "gi"),
  // https://regex101.com/r/aoOq8I/1
  // match unknown release groups in generic formats, -groupName$, -[groupName]$
  // the dash is required or else things like `My File [1080p] [HEVC].mp4` would match as "HEVC"
  /(?<=-)(?<name>[A-z0-9]{4,}(?=\/|$))/gi,
];

export class PropertyReleaseGroup extends Property<"releaseGroup"> {
  readonly key = "releaseGroup";

  extract(cleanPath: string, parser: ApolloParser) {
    for (const pattern of RELEASE_GROUP_PATTERNS) {
      const match = parser.getMatch(cleanPath, pattern, false);
      if (match) {
        // prettier-ignore
        return match.groups!.name
          .replaceAll(" ", ".") // restore dots that may be stripped when cleaning the path
          .replace(/^\[|\]$/g, ""); // strip brackets [] from the match
      }
    }
  }
}
