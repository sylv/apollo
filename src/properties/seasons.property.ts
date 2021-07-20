import { Property } from "./property";
import { ApolloParser } from "../classes/apollo-parser";
import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";

// https://regex101.com/r/ADDnD0/1
const SEASONS_RANGE_PATTERN = `${PART_START_PATTERN}(?:Seasons?\\W?|Series\\W?|SE\\W?|S)?(?<start>[0-9]{1,2}) ?- ?(?<end>[0-9]{1,2})${PART_END_PATTERN}`;
const SEASONS_RANGE_REGEX = new RegExp(SEASONS_RANGE_PATTERN, "gi");

export class PropertySeasons extends Property<"seasons"> {
  readonly key = "seasons";

  extract(cleanPath: string, parser: ApolloParser) {
    // const listMatch = parser.getMatch(cleanPath, SEASONS_LIST_REGEX, false);
    // if (listMatch) {
    //   const list = listMatch.groups!.list.split(/,? ?/g);
    //   console.log({ list });
    //   return list.map((part) => +part).filter((value) => !isNaN(value));
    // }

    const rangeMatch = parser.getMatch(cleanPath, SEASONS_RANGE_REGEX, false);
    if (rangeMatch) {
      const seasonStart = +rangeMatch.groups!.start;
      const seasonEnd = +rangeMatch.groups!.end;
      if (isNaN(seasonStart) || isNaN(seasonEnd)) return;
      const index: number[] = [];
      for (let i = seasonStart; i <= seasonEnd; i++) {
        index.push(i);
      }

      return index;
    }
  }
}
