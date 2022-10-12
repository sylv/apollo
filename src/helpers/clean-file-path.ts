import path from "path";
import { ALL_EXTENSIONS, SUBTITLE_EXTENSIONS } from "../constants";
import { stripSpacePlaceholders } from "./strip-space-placeholders";

const EXPLICITLY_STRIP_PARTS = new Set([
  "tv shows",
  "videos",
  "movies",
  "shows",
  "series",
  "seasons",
  "import",
  "clean",
  "data",
  "library",
  "media",
  "mnt",
  "downloads",
  "active",
  "complete",
  "incomplete",
  "downloading",
  "torrents",
  "torrent",
]);

const IGNORE_PATH_PART_REGEX = /^(?:[A-Z]:|[a-z]+)$/i;
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
  let hitUnignoredPart = false;

  for (let i = 0; i < filePathParts.length; i++) {
    const filePathPart = filePathParts[i];
    const lower = filePathPart.toLowerCase();
    if (EXPLICITLY_STRIP_PARTS.has(lower)) {
      continue;
    }

    const isLastPart = i === filePathParts.length - 1;
    const ext = isLastPart ? ALL_EXTENSIONS.find((ext) => lower.endsWith(ext)) : null;
    const withoutExtension = ext ? filePathPart.slice(0, -ext.length) : filePathPart;
    const cleanPathPartWithoutExt = stripSpacePlaceholders(withoutExtension);
    const cleanPathPart = ext ? `${cleanPathPartWithoutExt}${ext}` : cleanPathPartWithoutExt;
    // we have to check the blacklist first or else something like "Trailers" would be discarded
    // before we check the blacklist
    if (EXCLUDE_BLACKLIST_REGEX.some((p) => p.test(cleanPathPart))) return;
    // only once it passes the blacklist can we do this check
    if (filePathPart.length <= 2 || (IGNORE_PATH_PART_REGEX.test(filePathPart) && !hitUnignoredPart)) continue;
    hitUnignoredPart = true;
    cleanedPathParts.push(cleanPathPart);
  }

  return cleanedPathParts.join("/");
}
