import { doubleSpaceRegex } from '../constants';

export const tagStart = ['(', '['];
export const tagEnd = [')', ']'];
const tagRegex = /(-| )?((\[|\().*?(\]|\))) ?/g;

/**
 * Strip [tags] and (tags) from a name, cleanly replacing them. Be warned, this can introduce "double-spaces" or ".  " in the text
 * which you should handle
 * @param input The input, "My Movie (2019) EpicRelease-[BluRay]"
 * @param regex If provided we'll use it to find and replace brackets, handling brackets that were sliced in half for you.
 * @returns The cleaned output, "My Movie EpicRelease"
 */
export const stripNameTags = (input: string, regex = tagRegex) => {
  return (
    input
      .replace(regex, rawMatch => {
        const match = rawMatch.trim();
        const startTagIndex = tagStart.findIndex(c => match.includes(c));
        const endTagIndex = tagEnd.findIndex(c => match.endsWith(c));

        // if we accidentally took half a tag with us, make sure we give back the closing bracket for the tag.
        if (endTagIndex !== -1 && startTagIndex === -1) {
          return tagEnd[endTagIndex];
        } else if (startTagIndex !== -1 && endTagIndex === -1) {
          return tagStart[startTagIndex];
        }

        return ' ';
      })
      // remove any double spaces we accidentally added
      .replace(doubleSpaceRegex, '')
      .trim()
  );
};
