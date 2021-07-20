import { ApolloParser } from "../classes/ApolloParser";
import { QUALITIES } from "../data";
import { Property } from "./Property";

export class PropertyQuality extends Property<"quality"> {
  readonly key = "quality";

  extract(cleanPath: string, parser: ApolloParser) {
    for (const quality of QUALITIES) {
      const match = parser.getMatch(cleanPath, quality.pattern, false);
      if (match) return quality.name;
    }
  }
}
