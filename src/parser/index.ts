import path from 'path';
import { schema } from './schema';
import { FileType, ParsedName, ParsedSchema } from './types';
import { cleanTitleName } from '../helpers/cleanTitleName';
import { cleanFileName } from '../helpers/cleanFileName';
import { doubleSpaceRegex } from '../constants';
import stringSimilarity from 'string-similarity';

const partRegex = /Part ([0-9]{1,2})(?: of [0-9]{1,2})?/i;
const spaceOrFullStopRegex = /\.| /;

export class NameParser {
  /**
   * Parse a torrent name into delicious structured data that is actually of use.
   * @param fileName The torrent name, "[pseudo] My Legal Show S02E01 A Very Awesome Episode Name [1080p] [h.265].mkv"
   */
  parse(fileName: string): ParsedName {
    const isPath = fileName.includes(path.sep);
    const parentDirPath = isPath && path.dirname(fileName);
    if (parentDirPath) {
      fileName = path.basename(fileName);
    }

    const { cleanedFileName, extension } = cleanFileName(fileName);
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

    let title = cleanTitleName(cleanedFileName.substring(0, parsed.firstMatchIndex)) || undefined;
    const type = parsed.resolved.episodeNumber || parsed.resolved.seasonNumber ? FileType.EPISODE : FileType.MOVIE;

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
        parsed.resolved.episodeName = cleanTitleName(rawEpisodeName);
      }

      // fallback episode name resolver
      if (!parsed.resolved.episodeName && title && / - /.test(title)) {
        const sepIndex = title.indexOf('-');
        // chances are we grabbed both by accident.
        // todo: this might be unreliable
        // basically, "Avatar (TLoK) - Republic City Hustle" => split into title/episodeName
        parsed.resolved.episodeName = cleanTitleName(title.substring(sepIndex + 1));
        title = title.substring(0, sepIndex).trim();
      }
    }

    const isCompleteCollection = parentDirPath && parentDirPath.toLowerCase().includes('complete');
    const data = {
      title,
      type,
      extension,
      ...parsed.resolved
    };

    if (!parentDirPath || (!isCompleteCollection && title && data.episodeNumber && data.seasonNumber)) {
      return data;
    }

    // if we couldn't get all the info we want from the file name alone, try looking at the parent.
    // sometimes it contains more info, at the risk of being mislead.
    const parsedParent = this.getParentTitle(parentDirPath);
    if (!parsedParent) {
      return data;
    }

    for (let key of Object.keys(parsedParent)) {
      // this specificaly handles "The Office" that is in the directory
      // "The Office (US)" where (US) is apparently important
      // also, "Brooklyn Nine-Nine/Brooklyn Nine Nine S01E01.mkv" will prefer the parent directories title over its own
      // as i've noticed people get lazy per-episode
      // todo: better checks for which has better "special" bits (e.g dashes) would be nice
      if (key === 'title' && data.title && parsedParent.title) {
        if (stringSimilarity.compareTwoStrings(parsedParent.title.toLowerCase(), data.title.toLowerCase()) > 0.8) {
          data.title = parsedParent.title;
          continue;
        }
      }

      if ((data as any)[key] === undefined) {
        (data as any)[key] = (parsedParent as any)[key];
      }
    }

    return data;
  }

  private getParentTitle(parentDirPath: string): ParsedName | undefined {
    const parentDirName = path.basename(parentDirPath);
    if (parentDirName.length <= 2 || !spaceOrFullStopRegex.exec(parentDirName)) {
      return;
    }

    const parsedParent = this.parse(parentDirName);
    if (parsedParent && parsedParent.title) {
      return parsedParent;
    }

    return this.getParentTitle(parentDirPath.slice(0, -parentDirName.length));
  }

  /**
   * Parse the schema and return its values in structured json. Cleanup has to be done on the output but it gets us some of the way there
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
        .replace(doubleSpaceRegex, ' ');

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
}
