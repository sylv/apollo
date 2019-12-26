const abbreviationIndex = /[a-z](\.[a-z])(?:$| )/g;
const splitRegex = /( |-)/g;
// if title has mutliple words together that are capitalised. e,g "IO"
// if the title has no spaces and has special characters (e.g "eps1.0_hellofriend.mov") - Mr. Robot why :(
// not 100% on this one ^ as it might break things.
const alreadyCapitalisedRegex = /([A-Z]{2,}|^[a-z0-9\.\_]+[\.\_]+[a-z0-9\.\_]+$)/;
const lowers = [
  'a',
  'an',
  'and',
  'but',
  'or',
  'for',
  'nor',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'into',
  'near',
  'of',
  'on',
  'onto',
  'to',
  'with',
  'is',
  'the'
];

/**
 * Convert a sentence to Title Case. Not perfect, but good enough(TM)
 * @param input The input, "my epic movie: return of the jedi"
 */
export function titleCase(input: string): string {
  // don't overwrite "IO" or etc with "Io", but still fix "Mission impossible 1"
  if (alreadyCapitalisedRegex.exec(input)) {
    return input.trim();
  }

  return (
    input
      .trim()
      .split(splitRegex)
      .map((word, index) => {
        if (word === '-' || word === ' ') {
          return word;
        }

        const raw = word.toLowerCase();
        // words at the start of the sentence should be capitalised regardless
        // words in the middle like "the" should be lowercased
        if (index !== 0 && lowers.includes(raw)) {
          return raw;
        }

        return raw.substring(0, 1).toUpperCase() + raw.slice(1).toLowerCase();
      })
      .join('')
      // fix abbreviation capitalisation, essentialy "House, m.d" => "House, M.D"
      .replace(abbreviationIndex, match => {
        return match.toUpperCase();
      })
      .trim()
  );
}
