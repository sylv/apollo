const lowers = [
  'a',
  'an',
  'the',
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
  'is'
];

/**
 * Convert a sentence to Title Case.
 * @param input The input, "my epic movie: return of the jedi"
 */
export function titleCase(input: string): string {
  // don't overwrite "IO" or etc with "Io"
  // previously we would skip if it contained any capitalisation but then "Mission impossible 1" happened
  // so it's easier to take a more aggressive approach unless we're sure it's fine
  if (/[A-Z]{2,}/.exec(input)) {
    return input.trim();
  }

  return (
    input
      // for something like "TRON: Legacy" this could destroy it if it's already
      // capitalised properly, turning it into like.. "Tron: Legacy"
      // .toLowerCase()
      .split(/( |-)+/g)
      .map((word, index) => {
        if ([' ', '-'].includes(word)) {
          return word;
        }

        const raw = word.toLowerCase();
        if (lowers.includes(raw) && index !== 0) {
          return raw;
        }

        return raw.substring(0, 1).toUpperCase() + raw.slice(1).toLowerCase();
      })
      .join('')
      // this lil bit does  "House,  M.d" => "House, M.D"
      .replace(/(\.)?([a-z])([^a-z]|$)(\.)?/g, (match, dot1 = '', char, extraChar = '', dot2 = '') => {
        if (dot1 !== '.' && dot2 !== '.') {
          return match;
        }

        return `${dot1}${char.toUpperCase()}${extraChar}${dot2}`;
      })
  );
}
