/**
 * strip parts of a name that have little to no importance.
 * used when matching a file with supporting files
 *
 * https://i.imgur.com/8DFqxXX.png
 */
export const stripFileNameRegex = / ?((\[|\().*?(\]|\))|-[A-z]+) ?/i;
/**
 * if the media file size is smaller than this, we ignore it and assume it's a feature or extra or something useless.
 */
export const minMediaFileSizeBytes = 25000000;
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
