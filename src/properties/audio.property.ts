import { PART_END_PATTERN, PART_START_PATTERN, SPACE_REGEX } from "../constants";
import { Property } from "./property";
import { ApolloParser } from "../classes/apollo-parser";

const PATTERNS: string[] = [
  "6ch",
  "2ch",
  "flac",
  "ac3",
  "aac",
  "wav",
  "mp3",
  // dd7.1
  // dd5.1
  // ddp5.1
  // 7.1
  `(?:ddp?)?(?:7|5)${SPACE_REGEX}1`,
  `dolby`,
  `atmos`,
  // 1000kbps
  // todo: this should just be a generic "bitrate" property
  `[0-9]{3,}kbps`,
];

const AUDIO_PATTERN = `${PART_START_PATTERN}(${PATTERNS.join("|")})${PART_END_PATTERN}`;
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
