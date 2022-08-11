import { ApolloParser } from "../classes/apollo-parser";
import { QUALITIES } from "../data/qualities";
import { Property } from "./property";

export class PropertyQuality extends Property<"quality"> {
  readonly key = "quality";

  extract(cleanPath: string, parser: ApolloParser) {
    for (const quality of QUALITIES) {
      const match = parser.getMatch(cleanPath, quality.pattern, false);
      if (match) return quality.name;
    }
  }
}
