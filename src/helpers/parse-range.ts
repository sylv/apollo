import { getAllMatches } from "./get-all-matches";

const NUMBER_REGEX = /\d+/g;

export function parseRange(input: string, expand: boolean) {
  const extracted: number[] = [];
  let previousBetween: string | undefined;
  let lastMatch: RegExpExecArray | undefined;
  for (const match of getAllMatches(input, NUMBER_REGEX)) {
    const value = +match[0];
    if (isNaN(value)) continue;
    if (lastMatch) {
      const between = input.substring(lastMatch.index + lastMatch[0].length, match.index);
      if (previousBetween !== undefined && between !== previousBetween) {
        break;
      }

      previousBetween = between;
    }

    extracted.push(value);
    lastMatch = match;
  }

  if (expand) {
    // convert [1, 3] to [1, 2, 3]
    const start = extracted[0];
    const end = extracted[extracted.length - 1];
    const expanded = [];
    for (let i = start; i <= end; i++) {
      expanded.push(i);
    }

    return expanded;
  }

  // make [1, 3] invalid
  // this is mostly for episode files, where "My File S01E01E03.mp4" is invalid
  for (let i = 0; i < extracted.length; i++) {
    const current = extracted[i];
    const previous = extracted[i - 1];
    if (previous && current - previous !== 1) {
      return;
    }
  }

  return extracted;
}
