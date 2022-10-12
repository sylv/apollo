export const SEARCH_ALIASES = [
  {
    pattern: /avatar \(?tlok\)?/i,
    title: "The Legend of Korra",
  },
  {
    pattern: /avatar -? ?(the last airbender|tla)( movie)?/i,
    title: "The Last Airbender",
  },
  {
    pattern: /top gear uk/i,
    title: "top gear",
  },
];

/**
 * Get the search query for a given search term. Handles things like aliases and stripping non-english characters.
 * @param input The search term
 * @param spaceChar The character to use as a space, for example "_"
 * @returns undefined if the input is not valid, for example all spaces.
 */
export function formatSearchQuery(input: string, spaceChar = " "): string | undefined {
  let query = input
    // "my show 1-17" -> "my show", removes season ranges from collections
    .replace(/[0-9]{1,2} ?- ?[0-9]{1,2}/g, "")
    .replace(/[^A-z0-9- ]/g, "")
    .split(/-| +/g)
    .join(" ")
    .toLowerCase()
    .trim();

  for (const alias of SEARCH_ALIASES) {
    const match = query.match(alias.pattern);
    if (match) return formatSearchQuery(alias.title, spaceChar);
  }

  query = query.trim();
  return query.replace(/ +/g, spaceChar) || undefined;
}
