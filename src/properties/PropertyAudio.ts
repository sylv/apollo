import { PART_END_PATTERN, PART_START_PATTERN, SPACE_REGEX } from "../constants";
import { Property } from "./Property";
import { ApolloParser } from "../classes/ApolloParser";

const AUDIO_PATTERN = `${PART_START_PATTERN}(6CH|2CH|flac|ac3|aac|wav|mp3|(?:ddp?)?(?:7|5)${SPACE_REGEX}1|dolby|atmos|[0-9]{3,}kbps)${PART_END_PATTERN}`;
const AUDIO_REGEX = new RegExp(AUDIO_PATTERN, "gi");

export class PropertyAudio extends Property<"audio"> {
  readonly key = "audio";

  extract(cleanPath: string, parser: ApolloParser) {
    return parser.getMatch(cleanPath, AUDIO_REGEX, true).map((match) => {
      const value = match[1];
      return value.replace(/(7|5) 1/i, "$1.1").toLowerCase();
    });
  }
}