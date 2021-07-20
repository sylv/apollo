import { stripSpacePlaceholders } from "./strip-space-placeholders";

const IGNORE_PATH_PART_REGEX = /^(?:[A-Z]:|[a-z]+|tv shows)$/i;
const EXCLUDE_BLACKLIST_REGEX = [
  /^lore$/i,
  /^histories(( and| &) lore)?$/i,
  /sample|^trailer(?! park)/i, // "excludes "trailer park boys"
  /^behind.the.scenes$/i,
  /^deleted.and.extended.scenes$/i,
  /^deleted.scenes$/i,
  /^extras?$/i,
  /^featurettes$/i,
  /^interviews$/i,
  /^scenes$/i,
  /^shorts$/i,
];

/**
 * Clean the file path and replace dots or underscores with spaces when necessary.
 * @returns undefined if the path is blacklisted.
 */
export function cleanFilePath(filePath: string): string | undefined {
  const filePathParts = filePath.split(/\/|\\/g);
  const cleanedPathParts: string[] = [];

  for (const filePathPart of filePathParts) {
    const cleanPathPart = stripSpacePlaceholders(filePathPart);
    // we have to check the blacklist first or else something like "Trailers" would be discarded
    // before we check the blacklist
    if (EXCLUDE_BLACKLIST_REGEX.some((p) => p.test(cleanPathPart))) return;
    // only once it passes the blacklist can we do this check
    if (filePathPart.length <= 2 || IGNORE_PATH_PART_REGEX.test(filePathPart)) continue;
    cleanedPathParts.push(cleanPathPart);
  }

  return cleanedPathParts.join("/");
}
