import { schema } from './schema';
import { ParsedSchema, ParsedName, FileType } from './types';
import { titleCase } from '../helpers/titleCase';
import { stripNameTags, tagStart, tagEnd } from '../helpers/stripNameTags';
import { mediaFileExtensions, fileExtensionRegex } from '../constants';

const groupExtra = /[\-]{1,}[A-z0-9]{2,}$/;
const randomShit = /dts|(dd)?((5|7)\.1(?:ch)?|ch|Atmos|nf|YIFY|Tigole|hc|Dolby|TrueHD|4k|HDR|Blu-?Ray|final cut|web-?[A-z]+|bd-?rip|dvd-?rip|UHD|ReEnc|(?:kor)?sub|[0-9]{1,2}bit)/;
const excessRegex = new RegExp(`(${groupExtra.source}|(\\[|\\(|\\.|-| )?${randomShit.source}(?:\\)|\\]|\\.|-| |$))`, 'ig');
const partRegex = /Part ([0-9]{1,2})(?: of [0-9]{1,2})?/i;

export class NameParser {
  /**
   * Parse a torrent name into delicious structured data that is actually of use.
   * @param fileName The torrent name, "[pseudo] My Legal Show S02E01 A Very Awesome Episode Name [1080p] [h.265].mkv"
   */
  parse(fileName: string): ParsedName {
    const { cleanedFileName, extension, excess } = this.cleanFileName(fileName);
    const parsed = this.parseSchema(cleanedFileName);
    // if the episode number already exists, it's probably apart of the episode name
    // if the year exists, it's probably a movie (e.g, "The Mockingjay Part 1") instead of an episode
    const partMatch = !parsed.resolved.episodeNumber && !parsed.resolved.year && cleanedFileName.match(partRegex);
    if (partMatch) {
      parsed.resolved.episodeNumber = +partMatch[1];
      parsed.matches.episodeNumber = partMatch;
      if (parsed.firstMatchIndex && parsed.firstMatchIndex > (partMatch.index as number)) {
        parsed.firstMatchIndex = partMatch.index;
      }
    }
    let title = this.cleanTitleName(cleanedFileName.substring(0, parsed.firstMatchIndex)) || undefined;
    const type = parsed.resolved.episodeNumber || parsed.resolved.seasonNumber ? FileType.EPISODE : FileType.MOVIE;

    if (extension) {
      parsed.resolved.extension = extension;
    }

    if (parsed.resolved.episodeNumber) {
      // more or less guess the episode name
      const episodeMatch = parsed.matches.episodeNumber as RegExpMatchArray;
      const episodeEndIndex = (episodeMatch.index as number) + episodeMatch[0].length;

      let nextMatchIndex = cleanedFileName.length;
      for (let match of Object.values(parsed.matches).filter(x => x) as RegExpMatchArray[]) {
        const index = match.index as number;
        if (index >= episodeEndIndex && (nextMatchIndex == undefined || index < nextMatchIndex)) {
          nextMatchIndex = index;
        }
      }

      const rawEpisodeName = cleanedFileName.substring(episodeEndIndex, nextMatchIndex).trim();
      if (rawEpisodeName) {
        parsed.resolved.episodeName = this.cleanTitleName(rawEpisodeName);
      }

      // fallback episode name resolver
      if (!parsed.resolved.episodeName && title && / - /.test(title)) {
        const sepIndex = title.indexOf('-');
        // chances are we grabbed both by accident.
        // todo: this might be unreliable
        // basically, "Avatar (TLoK) - Republic City Hustle" => split into title/episodeName
        parsed.resolved.episodeName = title.substring(sepIndex + 1).trim();
        title = title.substring(0, sepIndex).trim();
      }
    }

    return {
      title,
      type,
      excess,
      ...parsed.resolved
    };
  }

  /**
   * Parse the schema and return its values in structured json
   */
  private parseSchema(cleanedInput: string) {
    let replacedInput = cleanedInput;
    const parsed: ParsedSchema<ParsedName> = {
      firstMatchIndex: undefined,
      replacedInput,
      matches: {},
      resolved: {}
    };

    for (let [key, item] of Object.entries(schema)) {
      let firstMatch: RegExpMatchArray | undefined;
      let value: string | number | undefined;

      replacedInput = replacedInput
        .replace(item.regex, (match, ...args) => {
          if (!firstMatch) {
            // last two args are some random shit we don't care about
            firstMatch = [match, ...args.slice(0, args.length - 2)];
            firstMatch.index = args[args.length - 2];

            // subsequent matches can be replaced, we only need one hopefully
            if ('replace' in item && item.replace === false) {
              return match;
            }
          }

          return ' ';
        })
        .replace(/[ ]{2,}/g, ' ');

      if (!firstMatch) {
        continue;
      }

      if (parsed.firstMatchIndex == undefined || parsed.firstMatchIndex > (firstMatch.index as number)) {
        parsed.firstMatchIndex = firstMatch.index;
      }

      if ('extract' in item) {
        value = item.extract(firstMatch);
      } else {
        if (item.index == undefined) {
          item.index = [1, 0];
        } else if (typeof item.index === 'number') {
          item.index = [item.index];
        }

        for (let index of item.index) {
          value = firstMatch[index];
          if (value) {
            break;
          }
        }

        if (item.number && value) {
          value = +value;
        }
      }

      if (value == undefined || (typeof value === 'number' && isNaN(value))) {
        continue;
      }

      parsed.matches[key] = firstMatch;
      (parsed.resolved as any)[key] = value;
    }

    return parsed;
  }

  /**
   * Remove the tags at the start of the string and leave the rest. "(test) [tag] Rick and Morty (yeet)" => "Rick and Morty (yeet)"
   */
  private removeStartTags(rawInput: string) {
    let sliceTo = 0;
    let inTag = false;
    for (let i = 0; i < rawInput.length; i++) {
      const char = rawInput[i];
      if (char.trim() === '') continue;
      if (tagStart.includes(char)) {
        inTag = true;
        continue;
      }

      if (tagEnd.includes(char)) {
        inTag = false;
        sliceTo = i;
        continue;
      }

      if (inTag) {
        continue;
      }

      break;
    }

    if (sliceTo !== 0) {
      return rawInput.substring(sliceTo + 1).trim();
    }

    return rawInput;
  }

  /**
   * Clean a title name. "avengers infinity war" => "Avengers Infinity War"
   * @param input The dirty title. If the title already contains capitalisation we'll leave it alone.
   */
  private cleanTitleName(rawInput: string) {
    // if the title starts with a tag, chances are it's worthless garbage. But if it contains a random tag, it could be an abbreviation.
    // specifically this is the handle "Avatar (TLA)" while also stripping the useless tag from "[pseudo] My Show S01E01"
    const input = this.removeStartTags(rawInput);

    return titleCase(input.trim().replace(/((-|,|\]|\[|\(|\))$|^(-|,|\]|\[|\(|\)))/g, ''));
  }

  /**
   * Convert a filthy torrent name to sommething usable.
   * - Removes junk we don't need that could get in the way, like "TrueHD" and shit like that.
   * - Replaces full stops with spaces when the torrent is likely using them in place of spaces
   * - Replaces underscores with spaces when the torrent is likely using themm in place of spaces
   * - Removes double-spaces, "  " => " "
   * @param fileName
   */
  private cleanFileName(fileName: string) {
    const extensionMatch = fileName.match(fileExtensionRegex);
    const extension = extensionMatch && extensionMatch[0];
    if (extension) {
      fileName = fileName.slice(0, -extension.length);
    }

    const excess: string[] = [];
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
      .replace(/[ .]{2,}/g, ' ')
      // if we strip part of a tag it could leave remenants, e.g `(1080p - )`
      // these two replaces will turn that into `(1080p)
      .replace(/ ?-? (\]|\))/g, '$1')
      .replace(/(\[|\() ?-? /g, '$1')
      .trim();

    return {
      excess,
      extension,
      cleanedFileName
    };
  }
}
