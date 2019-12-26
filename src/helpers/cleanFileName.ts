import { fileExtensionRegex } from '../constants';
import { stripNameTags } from './stripNameTags';

const groupExtra = /[\-]{1,}[A-z0-9]{2,}$/;
const randomShit = /dts|(dd)?((5|7)\.1(?:ch)?|ch|Atmos|nf|YIFY|Tigole|multi|hc|Dolby|TrueHD|4k|HDR|Blu-?Ray|final cut|web-?[A-z]+|bd-?rip|dvd-?rip|UHD|ReEnc|(?:kor)?sub|[0-9]{1,2}bit)/;
const excessRegex = new RegExp(`(${groupExtra.source}|(\\[|\\(|\\.|-| )?${randomShit.source}(?:\\)|\\]|\\.|-| |$))`, 'ig');
const specialDoubleSpaceRegex = /[ .]{2,}/g;
const cleanTagEndRegex = / ?-? (\]|\))/g;
const cleanTagStartRegex = /(\[|\() ?-? /g;

/**
 * Convert a filthy torrent name to sommething usable.
 * - Removes junk we don't need that could get in the way, like "TrueHD" and shit like that.
 * - Replaces full stops with spaces when the torrent is likely using them in place of spaces
 * - Replaces underscores with spaces when the torrent is likely using themm in place of spaces
 * - Removes double-spaces, "  " => " "
 */
export function cleanFileName(fileName: string) {
  const extensionMatch = fileName.match(fileExtensionRegex);
  const extension = (extensionMatch && extensionMatch[0]) || undefined;
  if (extension) {
    fileName = fileName.slice(0, -extension.length);
  }

  // strip some useless things without damaging other tags
  let cleanedFileName = stripNameTags(fileName, excessRegex);

  // some files use full stops instead of spaces
  // some files use underscores instead of spaces
  // some files use spaces like they should be used
  // and some torrents use primarily full stops with some spaces on the end...
  // and some torrents have full stops in the title but use spaces.
  // and some torrents have underscores in some places but use primarily spaces.
  // we'll convert to spaces only if it looks like the title is using mostly full stops or underscores
  // we intentionally use fileName in place of cleanedFileName as preprocessing might have introduced more spaces then full stops
  // we also give spaces a bit of a handicap because when used properly, full stops should be used minimally
  const spaceCount = fileName.split(' ').length / 1.4;
  const underscoreCount = fileName.split('_').length;
  const fullStopCount = fileName.split('.').length;
  const hasMoreUnderscores = underscoreCount > spaceCount && underscoreCount > fullStopCount;
  const hasMoreFullStops = fullStopCount > spaceCount && fullStopCount > underscoreCount;
  if (hasMoreFullStops) {
    cleanedFileName = cleanedFileName.split('.').join(' ');
  } else if (hasMoreUnderscores) {
    cleanedFileName = cleanedFileName.split('_').join(' ');
  }

  cleanedFileName = cleanedFileName
    // remove double spaces
    // also threw in the . to fix "Avengers Endgame 2019. 2160p. Ita Eng x265" handling
    // not sure about ^ because it kinda undoes a lot of the work we did above.
    .replace(specialDoubleSpaceRegex, ' ')
    // if we strip part of a tag it could leave remenants, e.g `(1080p - )`
    // these two replaces will turn that into `(1080p)
    .replace(cleanTagEndRegex, '$1')
    .replace(cleanTagStartRegex, '$1')
    .trim();

  return {
    extension,
    cleanedFileName
  };
}
