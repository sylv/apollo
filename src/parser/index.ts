import path from 'path';
import { schema as rawSchema } from './schema';
import { FileType, ParsedName, ParsedSchema } from './types';
import { cleanTitleName } from '../helpers/cleanTitleName';
import { cleanFileName } from '../helpers/cleanFileName';
import stringSimilarity from 'string-similarity';

const sortedSchema = Object.entries(rawSchema).sort(item => ((item[1] as any).replace ? -1 : 1));
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
    const partMatch = !parsed.resolved.episodeNumber && !parsed.resolved.year && partRegex.exec(cleanedFileName);
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
      // if it looks like an episode, try get the episode name by assuming it's between the season/episode
      // number and the next match.
      // this is definitely hacky, but it seems to be "good enough" for most cases.
      const episodeMatch = parsed.matches.episodeNumber as RegExpExecArray;
      const episodeEndIndex = (episodeMatch.index as number) + episodeMatch[0].length;
      let nextMatchIndex = cleanedFileName.length;
      for (let match of Object.values(parsed.matches).filter(x => x) as RegExpExecArray[]) {
        const index = match.index as number;
        if (index >= episodeEndIndex && (nextMatchIndex == undefined || index < nextMatchIndex)) {
          nextMatchIndex = index;
        }
      }

      const rawEpisodeName = cleanedFileName.substring(episodeEndIndex, nextMatchIndex).trim();
      if (rawEpisodeName) {
        parsed.resolved.episodeName = cleanTitleName(rawEpisodeName);
      } else if (title && title.includes(' - ')) {
        // if we failed to grab an episode name, we can *try* grab it by looking at the title.
        // if it's lets say "My Show - An Episode Name", then this should work.
        // if it's something else, it might not.
        // we could verify this is accurate by comparing other titles from the same directory, if it's a
        // whole season. But that would be complicated to do with the current layout.
        const sepIndex = title.indexOf(' - ');
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
    const parsed: ParsedSchema<ParsedName> = {
      firstMatchIndex: undefined,
      replacedInput: cleanedInput,
      matches: {},
      resolved: {}
    };

    // do the parts with replace: true first so later indexes aren't fucked up
    for (let [key, item] of sortedSchema) {
      item.regex.lastIndex = 0;
      let value: string | number | undefined;
      let firstMatch: RegExpExecArray | undefined;
      let lastMatch: RegExpExecArray | null;
      // parsed.replacedInput.replace could work, but we want the full RegExpExecArray which, to my knowledge,
      // String.replace doesn't give. Previously we made the array ourselves from what String.replace did
      // give, but typescript didn't like that.
      while ((lastMatch = item.regex.exec(parsed.replacedInput))) {
        if (!firstMatch) {
          firstMatch = lastMatch;
          if (parsed.firstMatchIndex == undefined || parsed.firstMatchIndex > (firstMatch.index as number)) {
            parsed.firstMatchIndex = firstMatch.index;
          }
        }

        if ('replace' in item && item.replace !== false) {
          parsed.replacedInput =
            parsed.replacedInput.substring(0, lastMatch.index) + parsed.replacedInput.substring(lastMatch.index + lastMatch[0].length);
        }
        // todo: in theory this is true but for some reason it fails under some tests so thats epic
        // else {
        //   // don't need to get more matches if we aren't replacing them
        //   break;
        // }

        // without the "g" flag, we'll loop forever
        if (!item.regex.flags.includes('g')) {
          break;
        }
      }

      if (!firstMatch) {
        continue;
      }

      if ('extract' in item) {
        value = item.extract(firstMatch);
      } else {
        if (item.index == undefined) {
          // get the first group or fall back to the whole match by default
          item.index = [1, 0];
        } else if (typeof item.index === 'number') {
          // makes it easier handling arrays only
          item.index = [item.index];
        }

        // get the value by trying all the provided indexes
        for (let index of item.index) {
          value = firstMatch[index];
          if (value) {
            break;
          }
        }

        // try parse the value as a number if needed
        if (item.number && value) {
          value = +value;
          if (isNaN(value)) {
            break;
          }
        }
      }

      //
      if (value == undefined) {
        continue;
      }

      parsed.matches[key] = firstMatch;
      (parsed.resolved as any)[key] = value;
    }

    return parsed;
  }
}
