/**
 * a list of file extensions that indicate that the file is a video.
 */
export const mediaFileExtensions = ['mp4', '3gp', 'mkv', 'mov', 'wmv', 'ogg', 'flv', 'avi', 'hdv', 'webm'];
/**
 * files we should take with us if they include the same name as the actual video file
 */
export const supportingFileExtensions = ['srt', 'sub'];
export const doubleSpaceRegex = /[ ]{2,}/g;
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

export const languages = ['ITA', 'ENG', 'RUS', 'SPA', 'JPN', 'KOR', 'GER', 'FRA', 'HIN'];
// h264, x264 etc are handled by regex. these are just "common" variants
export const hevcNames = ['mpeg-h', 'mpeg-2', 'hevc'];
export const avcNames = ['avc', 'mpeg-4'];
