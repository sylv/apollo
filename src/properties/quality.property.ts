import { ApolloParser } from "../classes/apollo-parser";
import { QUALITIES } from "../data/qualities";
import { Property } from "./property";

const STRIP_REGEX = /\bremux\b/gi;

export class PropertyQuality extends Property<"quality"> {
  readonly key = "quality";

  extract(cleanPath: string, parser: ApolloParser) {
    parser.getMatch(cleanPath, STRIP_REGEX, false);
    for (const quality of QUALITIES) {
      const match = parser.getMatch(cleanPath, quality.pattern, false);
      if (match) return quality.name;
    }
  }
}
