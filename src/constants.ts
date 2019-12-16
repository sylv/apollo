/**
 * strip parts of a name that have little to no importance.
 * used when matching a file with supporting files
 *
 * https://i.imgur.com/8DFqxXX.png
 */
export const stripFileNameRegex = / ?((\[|\().*?(\]|\))|-[A-z]+) ?/i;
/**
 * a list of file extensions that indicate that the file is a video.
 *
 */
export const mediaFileExtensions = ['mp4', '3gp', 'mkv', 'mov', 'wmv', 'ogg', 'flv', 'avi', 'hdv', 'webm'];
/**
 * files we should take with us if they include the same name as the actual video file
 */
export const supportingFileExtensions = ['srt', 'sub'];
/**
 * Matches supported extensions at the end of a string
 */
export const fileExtensionRegex = new RegExp(`\\.(${mediaFileExtensions.join('|')}|${supportingFileExtensions.join('|')})$`, 'i');
/**
 * Files that we should ignore if the path includes this. E.g, this would ignore all files in a "Featurettes" directory
 */
export const ignoreFilesIncluding = [
  'sample',
  'preview',
  // todo: we should take these with us instead of ignoring them
  'lore',
  'histories',
  'featurette',
  'extra'
];
