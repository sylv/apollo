import { apollo } from "../types";
import { Property } from "./property";
import { ApolloParser } from "../classes/apollo-parser";
import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";

// match "2018-19", "2018" etc
// does not match "2021" in "21.08.2021" as PropertyDate handles that
const YEAR_PATTERN = `${PART_START_PATTERN}(?<![0-9](?:\\.|-|\\/))(?<start>[0-9]{4})(?: ?- ?(?<end>[0-9]{2,4}))?${PART_END_PATTERN}`;
const YEAR_REGEX = new RegExp(YEAR_PATTERN, "gi");

export class PropertyYear extends Property<"startYear" | "endYear"> {
  write(cleanPath: string, parsed: Partial<apollo.Parsed>, parser: ApolloParser) {
    const match = parser.getMatch(cleanPath, YEAR_REGEX, false);
    if (!match || !match.groups) return parsed;
    const start = +match.groups.start;
    // used to handle 2013-19 and similar ranges
    // doesnt handle something like 1973-13 how you might expect (1973-2013) but im pretty sure
    // no one is gonna be stupid enough to use that format
    const startPrefix = match.groups.start.substring(0, 2);
    const end = match.groups.end ? +match.groups.end.padStart(4, startPrefix) : undefined;
    if (start) parsed.startYear = start;
    if (end) parsed.endYear = end;
    return parsed;
  }
}
