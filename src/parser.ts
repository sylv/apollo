import signale from "signale";
import { lookup } from "./helpers/lookup";
import { apollo } from "./types";
import {
  YEAR_REGEX,
  RESOLUTION_REGEX,
  COLLECTION_REGEX,
  SEASON_EPISODE_PATTERNS,
  SPACE_PLACEHOLDERS,
  IGNORE_PATH_PART_REGEX,
  ALL_EXTENSIONS,
  SUPPORTING_FILE_EXTENSIONS,
  AUDIO_REGEX,
  LANGUAGE_REGEX
} from "./constants";

export class ApolloParser {
  protected readonly log = signale.scope("parser");
  protected matchIndexes: { start: number; end: number }[] = [];

  public async parse(filePath: string, parentData?: Partial<apollo.Parsed>): Promise<apollo.Parsed | void> {
    let extension = parentData ? parentData.extension : ALL_EXTENSIONS.find(ext => filePath.endsWith(ext));
    if (!extension) {
      this.log.debug(`Could not extract file extension for "${filePath}"`);
      return;
    }

    const fileType = SUPPORTING_FILE_EXTENSIONS.includes(extension) ? apollo.FileType.SUPPORTING : apollo.FileType.MEDIA;
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
    const rawTitle = cleanPath
      .substring(closestPathSep + 1, firstMatchIndex.start)
      // remove tags like [1080p]
      .replace(/\[.*?\]/g, " ")
      // remove release group suffixes like -QxR
      .replace(/-[a-z]{2,}(?=$|\/)/gi, "")
      // trim trailing ('s from e.g "Avatar - The Last Airbender Movie ("
      .replace(/ ?(?:\(|\[) ?$/g, "")
      // remove "movie 1" from the start and "movie" from the end, if they exist.
      .replace(/^movie(?: [0-9])? | movie$/i, "")
      // remove urls that weren't in brackets
      .replace(/(www\.)?[a-z0-9]+\.(?:com|org|me|se|info)/i, "")
      // remove things like "(auto)" at the start of strings, e.g "(auto) Top Gear"
      .replace(/^\([A-z0-9]+\) ?/, "")
      .trim();

    if (!rawTitle) {
      this.log.error(`Could not extract title for "${filePath}"`);
      return;
    }

    const results = await lookup(rawTitle);
    // if (results.length === 0 && rawTitle.includes(" - ")) {
    //   const altTitle = rawTitle.split(" - ")[0];
    //   const altResults = await lookup(altTitle);
    //   if (altResults.length) results = altResults;
    // }

    const type = index.seasonNumber || index.episodeNumber ? apollo.TitleType.TV : apollo.TitleType.MOVIE;
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

  protected getLanguages(cleanPath: string) {
    return this.getMatch(cleanPath, LANGUAGE_REGEX, true).map(match => match[0]);
  }

  protected getAudio(cleanPath: string) {
    return this.getMatch(cleanPath, AUDIO_REGEX, true).map(match => match[0]);
  }

  protected getBestResult(results: apollo.LookupResult[], title: string, type: apollo.TitleType, year?: number) {
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

  protected firstMatchIndex(afterIndex: number = 0) {
    this.matchIndexes.sort((a, b) => a.start - b.start);
    if (afterIndex === 0) return this.matchIndexes[0];
    return this.matchIndexes.find(m => afterIndex < m.end);
  }

  protected getYear(cleanPath: string) {
    const match = this.getMatch(cleanPath, YEAR_REGEX, false);
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

  protected getResolution(cleanPath: string) {
    const match = this.getMatch(cleanPath, RESOLUTION_REGEX, false);
    if (!match) return;

    return +match;
  }

  protected getCollectionState(cleanPath: string) {
    const match = this.getMatch(cleanPath, COLLECTION_REGEX, false);
    return !!match;
  }

  protected getSeasonAndEpisode(cleanPath: string) {
    let seasonNumber: number | undefined;
    let episodeNumber: number | undefined;

    for (const pattern of SEASON_EPISODE_PATTERNS) {
      const matches = this.getMatch(cleanPath, pattern, true);
      for (const match of matches) {
        if (!match.groups) continue;
        const se = match.groups.season ? +match.groups.season : undefined;
        const ep = match.groups.episode ? +match.groups.episode : undefined;
        if (se && ep) {
          // if we have both, trust it more than separate parts we got.
          // e.g, "Season 1\S02E02", this should give us S02E02 instead of S01E02
          seasonNumber = se;
          episodeNumber = ep;
          break;
        }

        if (se && !seasonNumber) seasonNumber = se;
        if (ep && !episodeNumber) episodeNumber = ep;
      }
    }

    return { seasonNumber, episodeNumber };
  }

  /**
   * Clean the file path and replace dots or underscores with spaces when necessary.
   */
  protected getCleanFilePath(filePath: string) {
    return (
      filePath
        .split(/\/|\\/g)
        .filter(p => p.length > 2 && !p.match(IGNORE_PATH_PART_REGEX))
        .map(this.handleSpaceReplacements.bind(this))
        // we use "/" to indicate a path. it's convenient.
        .join("/")
    );
  }

  /**
   * Given a file or directory name, replace dots or underscores with spaces if it is suspected of using
   * them as a replacement.
   */
  protected handleSpaceReplacements(filePathPart: string) {
    const spaceCount = filePathPart.split(" ").length;
    const matches: { char: string; count: number }[] = [];
    for (const char of SPACE_PLACEHOLDERS) {
      const count = filePathPart.split(char).length;
      matches.push({ char, count });
    }

    matches.sort((a, b) => b.count - a.count);
    const best = matches[0];
    const worst = matches[matches.length - 1];
    if (best.count > spaceCount * 0.5 && best.count - worst.count > 4) {
      return filePathPart.split(best.char).join(" ");
    }

    return filePathPart;
  }

  // getting all matches, even if we're only using one, is important for title extraction.
  protected getMatch(target: string, pattern: RegExp, returnAll: true): RegExpExecArray[];
  protected getMatch(target: string, pattern: RegExp, returnAll: false): RegExpExecArray | void;
  protected getMatch(target: string, pattern: RegExp, returnAll: boolean): RegExpExecArray | RegExpExecArray[] | void {
    pattern.lastIndex = 0;
    if (!pattern.flags.includes("g")) {
      throw new Error(`Cannot use ApolloParser#match() on RegExp without specifying "g" flag`);
    }

    const matches: RegExpExecArray[] = [];
    let match;
    while ((match = pattern.exec(target))) {
      matches.push(match);
      const startIndex = match.index ? match.index : target.lastIndexOf(match[0]);
      if (startIndex === -1) continue;
      this.matchIndexes.push({ start: startIndex, end: startIndex + match[0].length });
    }

    if (returnAll) return matches;
    return matches[matches.length - 1];
  }
}
