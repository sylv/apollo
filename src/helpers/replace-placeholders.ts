import sanitize from "sanitize-filename";
import { ApolloOutput } from "../types";

// https://regex101.com/r/gstRDk/1
// cleans up templates when they are missing placeholders
const DOUBLE_SPACE_REGEX = / +/g; // title     episode name.mp4
const UNUSED_DASH_OR_SPACE_REGEX = /(?<=\/) |( - | )(?=\/|\.)/g; // title - .mp4
const EMPTY_TAG_REGEX = /(?:\[|\()[a-z0-9]{2,}=(\)|\])/gi; // [imdbId=]
const EMPTY_BRACKET_REGEX = /(?:\[\]|\{\}|\(\))/g; // title ().mp4
const PLACEHOLDER_REGEX = /\{([a-z0-9]+)\}/gi;
const SEASON_EPISODE_REGEX = /S(\d{1,4})E(\d{1,4})/i;

const pad = (index: number) => index.toString().padStart(2, "0");
const toString = (input: unknown) => {
  if (!input || (Array.isArray(input) && input.length === 0)) {
    return "";
  }

  if (Array.isArray(input)) {
    if (typeof input[0] === "number") return input.join("-");
    const deduped = [...new Set(input)];
    return deduped.join(" ");
  }

  return `${input}`;
};

export const replacePlaceholders = (pattern: string, replacements: ApolloOutput | Record<string, unknown>) => {
  return (
    pattern
      // prevents double dots for exts in filenames
      // todo: dont do this, ext should not include a dot but thats a breaking change
      .replace(/\.\{extension\}$/, "{extension}")
      .replace(PLACEHOLDER_REGEX, (match, name) => {
        const value = (replacements as any)[name];
        const str = toString(value);
        return sanitize(str, {
          replacement: " ",
        });
      })
      .replace(SEASON_EPISODE_REGEX, (match, season, episode) => {
        return `S${pad(season)}E${pad(episode)}`;
      })
      .replace(EMPTY_TAG_REGEX, " ")
      .replace(EMPTY_BRACKET_REGEX, " ")
      .replace(DOUBLE_SPACE_REGEX, " ")
      .replace(UNUSED_DASH_OR_SPACE_REGEX, "")
  );
};
