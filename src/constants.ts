// properties will almost never be at the very start of the string, and if they are
// they are usually in brackets, so we exclude matches at the very start of the string.
export const PART_START_PATTERN = "(?<=^|\\W|\\/)";
export const PART_END_PATTERN = "(?=$|\\W|\\/)";
export const SPACE_REGEX = "(?:\\.| )";
export const SUPPORTED_MEDIA_EXTENSIONS = [".mp4", ".m4v", ".3gp", ".mkv", ".mov", ".wmv", ".ogg", ".flv", ".avi", ".hdv", ".webm"];
export const SUBTITLE_FILE_EXTENSIONS = [".srt", ".sub"];
export const ALL_EXTENSIONS = [...SUPPORTED_MEDIA_EXTENSIONS, ...SUBTITLE_FILE_EXTENSIONS];
