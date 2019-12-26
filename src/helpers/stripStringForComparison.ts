import { stripNameTags } from './stripNameTags';
import { fileExtensionRegex, doubleSpaceRegex } from '../constants';

const dotRegex = /\.|_/g;
const extraRegex = / ?-[A-z]+/gi;
const resolutionRegex = /[0-9]{3,4}p/i;
/**
 * Strip undesirable parts of a string to make it better for direct comparison
 * @param input  The input, "I.Am.Mother.2019.1080p.WEBRip.x264-[YTS.LT].mp4"
 * @returns "i am mother 2019 webrip x264"
 */
// todo: at some point, just parsing the file name of the file and comparing names and
// possibly years (movies) or season numbers & episodes (tv shows) would be more reliable
export function stripStringForComparison(input: string) {
  return (
    stripNameTags(input.toLowerCase())
      // remove extensions
      .replace(fileExtensionRegex, '')
      // replace dots and underscores with spaces. we won't lose anything
      .replace(dotRegex, ' ')
      // strip things like -SPARKS
      .replace(extraRegex, '')
      // remove resolution, because sometimes "My.Movie.BluRay.720p.x264.srt" is intended for "My.Movie.2009.BluRay.1080p.x264"
      .replace(resolutionRegex, ' ')
      // remove double spaces that we may have created
      .replace(doubleSpaceRegex, ' ')
      .trim()
  );
}
