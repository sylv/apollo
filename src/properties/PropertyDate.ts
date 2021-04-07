import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";
import { ApolloParser } from "../classes/ApolloParser";
import { Property } from "./Property";

const GLOBAL_DATE_PATTERN = `${PART_START_PATTERN}(?:[0-9]{1,2}(?:\\.|-|\\/)){2}[0-9]{4}${PART_END_PATTERN}`;
const GLOBAL_DATE_REGEX = new RegExp(GLOBAL_DATE_PATTERN, "g");
const US_DATE_PATTERN = `${PART_START_PATTERN}[0-9]{4}(?:(?:\\.|-|\\/)[0-9]{1,2}){2}${PART_END_PATTERN}`;
const US_DATE_REGEX = new RegExp(US_DATE_PATTERN, "g");
const DATE_REGEX = [GLOBAL_DATE_REGEX, US_DATE_REGEX];

export class PropertyDate extends Property<"date"> {
  readonly key = "date";

  extract(cleanPath: string, parser: ApolloParser) {
    for (const regex of DATE_REGEX) {
      const match = parser.getMatch(cleanPath, regex, false);
      if (match) {
        const date = Date.parse(match[0]);
        if (!isNaN(date)) return new Date(date);
      }
    }
  }
}
