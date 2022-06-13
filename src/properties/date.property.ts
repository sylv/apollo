import { ApolloParser } from "../classes/apollo-parser";
import { toDate } from "../helpers/to-date";
import { Property } from "./property";

const DATE_REGEX = [
  // 2019/08/21
  // 1980-08-21
  // 1980.08.21
  /\b(?<year>[0-9]{4})(?:\/|-|\.)(?<month>[0-9]{2})(?:\/|-|\.)(?<day>[0-9]{2})\b/g,
  // 21/08/2019
  // 21/08/1980
  // 21.08.1980
  /\b(?<month>[0-9]{2})(?:\/|-|\.)(?<day>[0-9]{2})(?:\/|-|\.)\b(?<year>[0-9]{4})/g,
  //20070631, year must be 20xx
  /\b(?<year>20[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})\b/g,
];

export class PropertyDate extends Property<"date"> {
  readonly key = "date";

  extract(cleanPath: string, parser: ApolloParser) {
    for (const regex of DATE_REGEX) {
      const match = parser.getMatch(cleanPath, regex, false);
      if (match) {
        const { year, month, day } = match.groups!;
        const result = toDate(year, month, day);
        if (result) return result;
      }
    }
  }
}
