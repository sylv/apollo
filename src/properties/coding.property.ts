import { PART_END_PATTERN, PART_START_PATTERN } from "../constants";
import { ApolloParser } from "../classes/apollo-parser";
import { Property } from "./property";

const CODING_PATTERN = `${PART_START_PATTERN}(HEVC|(?:x|h)( |\\.)?26(?:5|4)|(?:10|8)bit)${PART_END_PATTERN}`;
const CODING_REGEX = new RegExp(CODING_PATTERN, "gi");

export class PropertyCoding extends Property<"coding"> {
  readonly key = "coding";

  extract(cleanPath: string, parser: ApolloParser) {
    return parser.getMatch(cleanPath, CODING_REGEX, true).map((match) => match[1].replace(/ +/g, ""));
  }
}
