export const SUPPORTED_MEDIA_EXTENSIONS = [".mp4", ".3gp", ".mkv", ".mov", ".wmv", ".ogg", ".flv", ".avi", ".hdv", ".webm"];
export const SUPPORTING_FILE_EXTENSIONS = [".srt", ".sub"];
export const ALL_EXTENSIONS = [...SUPPORTED_MEDIA_EXTENSIONS, ...SUPPORTING_FILE_EXTENSIONS];
export const SPACE_PLACEHOLDERS = ["."];
export const SERIES_ALIASES = [
  {
    pattern: /avatar \(?tlok\)?/i,
    title: "The Legend of Korra"
  },
  {
    pattern: /avatar -? ?the last airbender( movie)?/i,
    title: "The Last Airbender"
  }
];

// patterns
export const YEAR_REGEX = /([0-9]{2}(?:\.|\/)[0-9]{2}(?:\.|\/))?(?<start>[0-9]{4})(?:-(?<end>[0-9]{2,4}))?(?=$| |\)|\])/gi;
export const DOUBLE_SPACE_REGEX = /[ ]{2,}/g;
export const RESOLUTION_REGEX = /[0-9]{3,4}(?=p)/gi;
export const AUDIO_REGEX = /ac3|aac|dd |7\.1|5\.1|dolby|atmos/gi;
export const LANGUAGE_REGEX = /(ITA|ENG|RUS)/g;
export const IGNORE_PATH_PART_REGEX = /^(?:[A-Z]:|[a-z]+|tv shows)$/i;
export const COLLECTION_REGEX = /complete|completa|collection|trilogy|duology|(?:season|se|s) ?[0-9]{1,2} ?- ?(?:season|se|s)?[0-9]{1,2}/gi;
export const EXCLUDE_BLACKLIST_REGEX = /lore|histories|sample|trailer|behind.the.scenes|deleted.and.extended.scenes|deleted.scenes|extras?|featurettes|interviews|scenes|shorts/i;
export const SEASON_EPISODE_RANGE_REGEX = /SE?(?<season>[0-9]{1,2})EP?(?<episodeStart>[0-9]{1,2})(?:-|E)+(?<episodeEnd>[0-9]{1,2})/i;
export const SEASON_EPISODE_PATTERNS = [
  // matches "1x1"
  // not "1x1t", "1x1-1x2"
  /(?<=^| |\/|\[|\()(?<season>[0-9]{1,2})x(?<episode>[0-9]{1,2})(?=$| |\/|]|\))/gi,
  // matches "Season 1 Episode 02", "Season 01"
  /Season.(?<season>[0-9]{1,2})(?:.Episode.(?<episode>[0-9]{1,2}))?/gi,
  // matches "SE1/01"
  /(?:SE|S)(?<season>[0-9]{1,2})\/(?<episode>[0-9]{1,2})/gi,
  // matches "SE01E01", "S01E01", "S01 E01", "S01"
  // not "Se7en", "S01e01-10"
  /(?<=^| |\/|\[|\()(?:SE|S)(?<season>[0-9]{1,2}) ?(?:(?:EP|E)(?<episode>[0-9]{1,2}))?(?=$| |\/|]|\))/gi,
  // matches "Part 3 of 3" if we're really desparate
  /Part (?<episode>[0-9]) of [0-9]/gi
];

// patterns for cleaning titles
export const TITLE_TAG_REGEX = /\[.*?\]/g;
export const TITLE_RELEASE_GROUP_REGEX = /-[a-z]{2,}(?=$|\/)/gi;
export const TITLE_TRAILING_TAG_REGEX = / ?(?:\(|\[) ?$/g;
export const TITLE_STRIP_WORD_REGEX = /^movie(?: [0-9])? | movie$/i;
export const TITLE_URL_REGEX = /(www )?[a-z0-9]+ (?:com|org|me|se|info)/i;
export const TITLE_PREFIX_TAG_REGEX = /^\([A-z0-9]+\) ?/;
