import { ApolloParser } from "../classes/ApolloParser";
import { SOURCES } from "../data";
import { Property } from "./Property";

export class PropertyQuality extends Property<"quality"> {
  readonly key = "quality";

  extract(cleanPath: string, parser: ApolloParser) {
    for (const source of SOURCES) {
      const match = parser.getMatch(cleanPath, source.regex, false);
      if (match) return source.name;
    }
  }
}
