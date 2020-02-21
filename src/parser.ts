import { lookup } from "./helpers/lookup";
import { log } from "./helpers/log";
import { apollo } from "./types";
import path from "path";
import * as constants from "./constants";

export class ApolloParser {
  protected readonly log = log.scope("parser");
  protected readonly matchIndexes: { start: number; end: number }[] = [];

  /**
   * Parse a torrent name or complete path.
   * @param filePath The torrent name or file path.
   * @param parentData Used internally.
   */
  public async parse(filePath: string, parentData?: Partial<apollo.Parsed>): Promise<apollo.Parsed | undefined> {
    let extension = parentData ? parentData.extension : constants.ALL_EXTENSIONS.find(ext => filePath.endsWith(ext));
    if (!extension) {
      this.log.debug(`Could not extract file extension for "${filePath}"`);
      return;
    }

    const fileType = constants.SUPPORTING_FILE_EXTENSIONS.includes(extension) ? apollo.FileType.SUPPORTING : apollo.FileType.MEDIA;
    const cleanPath = this.getCleanFilePath(filePath.endsWith(extension) ? filePath.slice(0, -extension.length) : filePath);
    const year = this.getYear(cleanPath);
    const resolution = this.getResolution(cleanPath);
    const audio = this.getAudio(cleanPath);
    const languages = this.getLanguages(cleanPath);
    const index = this.getSeasonAndEpisode(cleanPath);

    // with collections, the top-most title might be for the whole series.
    // trusting the file name alone is more reliable, though will mean we get less information overall.
    // this will handle something like
    // "The Hobbit & Lord of the Rings Collection/The Lord of the Rings/3-Return of the King.mkv"
    // where we would otherwise pick up "The Hobbit & Lord of the Rings Collection" as the title.
    const collection = parentData ? true : this.getCollectionState(cleanPath);
    if (parentData === undefined && collection) {
      const lastSep = cleanPath.lastIndexOf("/") + 1;
      const fileName = cleanPath.substring(lastSep);
      const firstFileNameMatch = this.firstMatchIndex(lastSep);
      // for something like "Bob's Burgers/SE2/01 Title.mp4", we don't want to rely solely on the
      // file name for the parent title's name as it doesn't have it.
      // if the file name's first match is at the start of the file name, don't try parse file name alone.

      // that makes very little sense.
      if (firstFileNameMatch && firstFileNameMatch.start > lastSep + 1) {
        const parser = new ApolloParser();
        return parser.parse(fileName, { collection: true, extension });
      }
    }

    // look up the title using the IMDb search API
    const firstMatchIndex = this.firstMatchIndex();
    if (!firstMatchIndex) {
      this.log.debug(`No matches on string "${cleanPath}"`);
      return;
    }

    const closestPathSep = cleanPath.substring(0, firstMatchIndex.start).lastIndexOf("/");
    const rawTitle = this.cleanTitle(cleanPath.substring(closestPathSep + 1, firstMatchIndex.start));

    if (!rawTitle) {
      this.log.error(`Could not extract title for "${filePath}"`);
      return;
    }

    const results = await lookup(rawTitle);
    const type = index.seasonNumber || index.episodeNumber.length ? apollo.TitleType.TV : apollo.TitleType.MOVIE;
    const best = this.getBestResult(results, rawTitle, type, year && year.start);
    // the length comparison is a hacky way to stop picking titles that IMDb gives us when it really doesn't
    // know what we want. it's basically just a hilariously long title, so checking if it's too long is pretty reliable.
    const title = best && best.title.length < rawTitle.length * 3 ? best.title : rawTitle;

    return {
      title,
      resolution,
      type,
      collection,
      extension,
      fileType,
      startYear: year && year.start,
      endYear: year && year.end,
      languages,
      audio,
      ...index
    };
  }

  /**
   * Get a list of language codes from the input.
   * @example ["ENG", "ITA"]
   */
  protected getLanguages(cleanPath: string): string[] {
    return this.getMatch(cleanPath, constants.LANGUAGE_REGEX, true).map(match => match[0]);
  }

  /**
   * Get misc audio information from the input.
   * @example ["AC3", "5.1"]
   */
  protected getAudio(cleanPath: string): string[] {
    return this.getMatch(cleanPath, constants.AUDIO_REGEX, true).map(match => match[0]);
  }

  /**
   * Get a year from the input.
   * @example { start: 2019, end: 2020 }
   */
  protected getYear(cleanPath: string): { start: number; end: number | undefined } | undefined {
    const match = this.getMatch(cleanPath, constants.YEAR_REGEX, false);
    if (!match || !match.groups) return;
    // by getting the first 2 digits on the start year, we can handle things like 2014-15 and 1944-45
    const start = +match.groups.start;
    const startPrefix = match.groups.start.substring(0, 2);
    const end = match.groups.end ? +match.groups.end.padStart(4, startPrefix) : undefined;

    return {
      start,
      end
    };
  }

  /**
   * Get the resolution of the input.
   * @example 1080
   */
  protected getResolution(cleanPath: string): number | undefined {
    const match = this.getMatch(cleanPath, constants.RESOLUTION_REGEX, false);
    if (!match) return;

    return +match;
  }

  /**
   * Get whether the input is a collection.
   * @example true
   */
  protected getCollectionState(cleanPath: string): boolean {
    const match = this.getMatch(cleanPath, constants.COLLECTION_REGEX, false);
    return !!match;
  }

  /**
   * Get the season and episode index from the input.
   * @param cleanPath { seasonNumber: 6, episodeNumber: 9 }
   */
  protected getSeasonAndEpisode(cleanPath: string): { seasonNumber: number | undefined; episodeNumber: number[] } {
    let seasonNumber: number | undefined;
    let episodeNumber: number[] = [];

    for (const pattern of constants.SEASON_EPISODE_PATTERNS) {
      const matches = this.getMatch(cleanPath, pattern, true);
      for (const match of matches) {
        if (!match.groups) continue;

        // if the char after the match is '-', it indicates a range that we didn't
        // grab. It could be something like "S01e01-10" when the actual index is "S01E05"
        // so we completely ignore these matches if they are suspicious.
        const endIndex = match.index + match[0].length;
        const charAfterMatch = cleanPath[endIndex];
        if (charAfterMatch === "-") continue;

        const se = match.groups.season ? +match.groups.season : undefined;
        const ep = match.groups.episode ? +match.groups.episode : undefined;
        if (se && ep) {
          // if we have both, trust it more than separate parts we got.
          // e.g, "Season 1\S02E02", this should give us S02E02 instead of S01E02
          seasonNumber = se;
          episodeNumber = [ep];
          break;
        }

        if (se && !seasonNumber) seasonNumber = se;
        if (ep && !episodeNumber.length) episodeNumber = [ep];
      }
    }

    if (!seasonNumber || !episodeNumber.length) {
      // this handles the case where the file contains multiple episodes.
      const fileName = path.basename(cleanPath);
      const rangeMatch = fileName.match(constants.SEASON_EPISODE_RANGE_REGEX);
      if (rangeMatch) {
        const groups = rangeMatch.groups || {};
        const adjustedIndex = (rangeMatch.index || fileName.indexOf(cleanPath[0])) + cleanPath.lastIndexOf("/") + 1;
        seasonNumber = +groups.season;
        episodeNumber = [+groups.episodeStart, +groups.episodeEnd];
        this.matchIndexes.push({ start: adjustedIndex, end: adjustedIndex + cleanPath[0].length });
      }
    }

    return { seasonNumber, episodeNumber };
  }

  /**
   * Get the best search result for the input.
   */
  protected getBestResult(
    results: apollo.LookupResult[],
    title: string,
    type: apollo.TitleType,
    year?: number
  ): apollo.LookupResult | undefined {
    const acceptable = results.filter(result => {
      if (type !== result.type) return false;
      if (type === apollo.TitleType.MOVIE && year && result.year && result.year !== year) return false;
      return true;
    });

    if (!title.includes(" ")) {
      // with single-word titles, i've found IMDb struggles sometimes,
      // for example returning "Logan Lucky (2017)" before "Logan (2017)". This is a hacky way
      // to get around that.
      const exact = results.slice(0, 4).find(t => t.title.toLowerCase() === title.toLowerCase());
      if (exact) return exact;
    }

    return acceptable.shift();
  }

  /**
   * Get the first match index in the input. For example, in "My Movie 2019", the first match would be the index of the start of "2019" as that is a year.
   * @param afterIndex Get the first match that is after this index.
   */
  protected firstMatchIndex(afterIndex: number = 0): { start: number; end: number } | undefined {
    this.matchIndexes.sort((a, b) => a.start - b.start);
    if (afterIndex === 0) return this.matchIndexes[0];
    return this.matchIndexes.find(m => afterIndex < m.end);
  }

  /**
   * Clean the file path and replace dots or underscores with spaces when necessary.
   */
  protected getCleanFilePath(filePath: string): string {
    return (
      filePath
        .split(/\/|\\/g)
        .filter(p => p.length > 2 && !p.match(constants.IGNORE_PATH_PART_REGEX))
        .map(this.handleSpaceReplacements.bind(this))
        // we use "/" to indicate a path. it's convenient.
        .join("/")
    );
  }

  /**
   * Given a file or directory name, replace dots that are used as placeholders for spaces.
   */
  protected handleSpaceReplacements(filePathPart: string): string {
    // previously I was trying to be smart here by counting how many spaces
    // and how many dots and only replacing if there were N amount of dots more than spaces
    // but that proved unreliable when I started encountering names with both mixed equally.
    // fuck standards I guess.
    for (const char of constants.SPACE_PLACEHOLDERS) {
      filePathPart = filePathPart.split(char).join(" ");
    }

    return filePathPart;
  }

  /**
   * Get a match from a string. This automatically handles pushiung to this.matchIndexes and
   * multiple matches for you and most of the time should be preferred over string.match or RegExp.exec.
   */
  // getting all matches, even if we're only using one, is important for title extraction.
  protected getMatch(target: string, pattern: RegExp, returnAll: true): RegExpExecArray[];
  protected getMatch(target: string, pattern: RegExp, returnAll: false): RegExpExecArray | undefined;
  protected getMatch(target: string, pattern: RegExp, returnAll: boolean): RegExpExecArray | RegExpExecArray[] | undefined {
    pattern.lastIndex = 0;
    if (!pattern.flags.includes("g")) {
      throw new Error(`Cannot use ApolloParser#match() on RegExp without specifying "g" flag`);
    }

    const matches: RegExpExecArray[] = [];
    let match;
    while ((match = pattern.exec(target))) {
      matches.push(match);

      // add the match to this.matchIndexes for title extraction
      const startIndex = match.index ? match.index : target.lastIndexOf(match[0]);
      if (startIndex === -1) continue;
      this.matchIndexes.push({ start: startIndex, end: startIndex + match[0].length });
    }

    if (returnAll) return matches;
    // matches.sort((a, b) => a.index - b.index);
    return matches[matches.length - 1];
  }

  /**
   * strip information that was incorrectly included in a title.
   * @example "(auto) Infinity War Movie 1 (" -> "Infinity War"
   */
  protected cleanTitle(title: string) {
    return (
      title
        // remove tags like [1080p]
        .replace(constants.TITLE_TAG_REGEX, " ")
        // remove release group suffixes like -QxR
        .replace(constants.TITLE_RELEASE_GROUP_REGEX, "")
        // trim trailing ('s from e.g "Avatar - The Last Airbender Movie ("
        .replace(constants.TITLE_TRAILING_TAG_REGEX, "")
        // remove "movie 1" from the start and "movie" from the end, if they exist.
        .replace(constants.TITLE_STRIP_WORD_REGEX, "")
        // remove urls that weren't in brackets
        .replace(constants.TITLE_URL_REGEX, "")
        // remove things like "(auto)" at the start of strings, e.g "(auto) Top Gear"
        .replace(constants.TITLE_PREFIX_TAG_REGEX, "")
        .trim()
    );
  }
}
