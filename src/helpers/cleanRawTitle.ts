import { titleCase } from "title-case";
import { IGNORE_TITLES } from "../data";

const TITLE_TAG_REGEX = /\[.*?\]/g;
const TITLE_RELEASE_GROUP_REGEX = /-[a-z]{2,}(?=$|\/)/gi;
const TITLE_TRAILING_TAG_REGEX = / ?(?:\(|\[|\-) ?$/g;
const TITLE_URL_REGEX = /(www(?:\.| ))?[a-z0-9]+(?:\.| )(?:com|org|me|se|info)/i;
const TITLE_BRACKETS_PREFIX_REGEX = /^\([A-z0-9]+\) ?/;
const PREFIX_REGEX = /^ ?(\[|\]|\(|\)|[0-9]-|-|\/)/g;
const SUFFIX_REGEX = /(\[|\]|\(|\)|-|\.|\/) ?$/g;
const SPECIAL_CHARACTER_REGEX = /^[\W ]+$/;

// matches after each "B" in "BigBuckBunny" so we can separate
// each title part, while not matching "O" in "IO"
const UPPERCASE_CHAR_REGEX = /(?=[A-Z])(?<=[^A-Z])/g;

/**
 * strip information that was incorrectly included in a title.
 * @example "(auto) Infinity War Movie 1 (" -> "Infinity War"
 */
export function cleanRawTitle(title: string) {
  let clean = title
    // remove tags like [1080p]
    .replace(TITLE_TAG_REGEX, " ")
    // remove release group suffixes like -QxR
    .replace(TITLE_RELEASE_GROUP_REGEX, "")
    // trim trailing ('s and -'s from e.g "Avatar - The Last Airbender Movie ("
    .replace(TITLE_TRAILING_TAG_REGEX, "")
    // remove urls that weren't in brackets
    .replace(TITLE_URL_REGEX, "")
    // remove things like "(auto)" at the start of strings, e.g "(auto) Top Gear"
    .replace(TITLE_BRACKETS_PREFIX_REGEX, "")
    // strip "1-" in "1-Fellowship of the Ring"
    // strip the "[" in "[ Title" etc
    .replace(PREFIX_REGEX, "")
    .replace(SUFFIX_REGEX, "")
    .trim();

  if (!clean.includes(" ")) {
    // "BigBuckBunny" > "Big Buck Bunny"
    clean = clean.replace(UPPERCASE_CHAR_REGEX, " ");
  }

  // if after cleaning the title is empty or is in IGNORE, it's useless
  if (!clean || IGNORE_TITLES.has(clean.toLowerCase())) return;

  // the commented code below breaks on something like "Rick and Morty/Season 5/Episode 3"
  // and I can't think of anything to prevent that so fuck it let's just not.
  // // if the title includes path separators it's likely an invalid match.
  // if (clean.includes("/")) return;

  // if the entire string is special characters, we probably failed
  // to extract a valid title.
  if (SPECIAL_CHARACTER_REGEX.test(clean)) return;
  return titleCase(clean);
}
