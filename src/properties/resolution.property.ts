import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";
import { ApolloParser } from "../classes/apollo-parser";
import { Property } from "./property";

// 1080p
const HEIGHT_PATTERN = `${PART_START_PATTERN}(?<height>[0-9]{3,4})(?:p)${PART_END_PATTERN}`;
const HEIGHT_REGEX = new RegExp(HEIGHT_PATTERN, "gi");
// 640x360
const WIDTH_HEIGHT_PATTERN = `${PART_START_PATTERN}(?<width>[0-9]{3,})x(?<height>[0-9]{3,})${PART_END_PATTERN}`;
const WIDTH_HEIGHT_REGEX = new RegExp(WIDTH_HEIGHT_PATTERN, "gi");

const RESOLUTION_REGEX = [HEIGHT_REGEX, WIDTH_HEIGHT_REGEX];

export class PropertyResolution extends Property<"resolution"> {
  readonly key = "resolution";

  extract(cleanPath: string, parser: ApolloParser) {
    for (const regex of RESOLUTION_REGEX) {
      const match = parser.getMatch(cleanPath, regex, false);
      if (match) {
        const { width, height } = match.groups!;
        return {
          width: width ? +width : null,
          height: height ? +height : null,
        };
      }
    }
  }
}
