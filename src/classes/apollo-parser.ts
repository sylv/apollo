import { search, SearchResult, TitleType } from "@ryanke/imdb-api";
import mem from "mem";
import { IMAGE_EXTENSIONS, SUBTITLE_EXTENSIONS, VIDEO_EXTENSIONS } from "../constants";
import { cleanFilePath } from "../helpers/clean-file-path";
import { cleanRawTitle } from "../helpers/clean-raw-title";
import { getAllMatches } from "../helpers/get-all-matches";
import { properties } from "../properties";
import { ApolloLogger, ApolloOutput, ApolloParserOptions, FileType } from "../types";

export interface ApolloMatch {
  start: number;
  end: number;
  countForChildFiltering: boolean;
}

export class ApolloParser {
  protected search = mem(search);
  protected log?: ApolloLogger;
  readonly matchIndexes: ApolloMatch[] = [];
  readonly options: ApolloParserOptions;
  constructor(options: ApolloParserOptions = {}) {
    this.options = options;
    this.log = this.options.logger;
  }

  /**
   * Parse a torrent name or complete path.
   * @param parentData internal
   */
  public async parse(input: string, parentData?: Partial<ApolloOutput>): Promise<ApolloOutput | undefined> {
    const extractedExt = this.getExtensionAndFileType(input);
    const extension = parentData?.extension ?? extractedExt?.extension;
    const fileType = extractedExt?.fileType;
    const data: Partial<ApolloOutput> = Object.assign({}, parentData, { extension, fileType });
    const inputWithoutExt = extension && input.endsWith(extension) ? input.slice(0, -extension.length) : input;
    const cleanPath = cleanFilePath(inputWithoutExt);
    if (!cleanPath) {
      this.log?.debug(`Skipping "${input}" as it contains undesirable keywords`);
      return;
    } else {
      this.log?.debug(`Cleaned path is "${cleanPath}"`);
    }

    this.parseProperties(cleanPath, data);
    this.parseTitleType(data);

    // with collections, the top-most title might be for the whole series.
    // trusting the file name alone is more reliable, though will mean we get less information overall.
    // this will handle something like
    // "The Hobbit & Lord of the Rings Collection/The Lord of the Rings/3-Return of the King.mkv"
    // where we would otherwise pick up "The Hobbit & Lord of the Rings Collection" as the title.
    if (parentData === undefined && data.collection) {
      // basically, if the first match in the file name is past the first
      // character in that file name, prefer the file name data as it indicates
      // the file name starts with the name of the series and not something like
      // the season number.
      const lastSep = cleanPath.lastIndexOf("/") + 1;
      const fileName = cleanPath.substring(lastSep);
      const firstFileNameMatch = this.firstMatchIndex(lastSep);
      if (firstFileNameMatch !== undefined && firstFileNameMatch > lastSep + 1) {
        const child = await this.parse(fileName, data);
        return Object.assign(data, child);
      }
    }

    data.title = this.extractTitleFromPath(cleanPath, data.titleType);
    if (data.title && !this.options.disableLookup) {
      const result = await this.getIMDBResult(data);
      if (result) {
        this.log?.debug(`Resolved "${data.title}" to "${result.name}" https://imdb.com/title/${result.id}`);
        data.title = result.name;
        data.imdb = result;
      } else {
        this.log?.debug(`No valid results for "${data.title}"`);
      }
    }

    return data as ApolloOutput;
  }

  /**
   * Run property parsers in the properties/ directory and add the extracted data to the provided data object.
   */
  protected parseProperties(cleanPath: string, data: Partial<ApolloOutput>) {
    for (const property of properties) property.write(cleanPath, data, this);
    return data;
  }

  /**
   * Parse the type of title based on extracted properties.
   * data.type will be undefined if the type is unclear.
   */
  protected parseTitleType(data: Partial<ApolloOutput>) {
    if (data.episodeNumber?.length) data.titleType = TitleType.EPISODE;
    else if (data.seasons?.length || data.episodes?.length || data.seasonNumber !== undefined) data.titleType = TitleType.SERIES;
    else if (data.startYear && !data.endYear) data.titleType = TitleType.MOVIE;
    else {
      this.log?.debug(`Cannot resolve title type based on parsed properties.`);
    }

    if (data.titleType !== undefined && !data.fileType) {
      data.fileType = FileType.Video;
    }
  }

  /**
   * Try extract the title from the cleaned file path.
   * This basically works by finding the longest string between matches,
   * so we have to match as much data as possible for accurate title extraction.
   * it will also try extract an episode name.
   */
  protected extractTitleFromPath(cleanPath: string, titleType?: TitleType): string | undefined {
    const titleCandidates: string[] = [];
    this.matchIndexes.sort((a, b) => a.start - b.start);
    for (let matchIndex = 0; matchIndex < this.matchIndexes.length; matchIndex++) {
      const match = this.matchIndexes[matchIndex];
      const previousMatch = this.matchIndexes[matchIndex - 1];
      const between = cleanPath.substring(previousMatch?.end ?? 0, match.start);
      if (!between.trim()) {
        continue;
      }

      const clean = cleanRawTitle(between);
      if (clean) {
        titleCandidates.push(clean);
      }
    }

    this.log?.debug(`Extracted title candidates`, titleCandidates);
    if (!titleCandidates[0]) {
      if (!this.matchIndexes[0]) return cleanRawTitle(cleanPath);
      return;
    }

    if (titleType === TitleType.MOVIE) {
      // for movies, there is no episode name that might get confused for a title,
      // so returning the furthest-right match is probably gonna be fine.
      const longest = titleCandidates.reduce((a, b) => (a.length > b.length ? a : b));
      const last = titleCandidates[titleCandidates.length - 1];
      if (longest.length >= last.length * 2) return longest;
      return last;
    }

    return titleCandidates[0];
  }

  /**
   * Get a match from a string. This automatically handles pushing to this.matchIndexes and
   * multiple matches for you and most of the time should be preferred over string.match or RegExp.exec.
   */
  public getMatch(target: string, pattern: RegExp, returnAll: true, countForChildFiltering?: boolean): RegExpExecArray[];
  public getMatch(target: string, pattern: RegExp, returnAll: false, countForChildFiltering?: boolean): RegExpExecArray | undefined;
  public getMatch(target: string, pattern: RegExp, returnAll: boolean, countForChildFiltering = true): RegExpExecArray | RegExpExecArray[] | undefined {
    const matches = getAllMatches(target, pattern);
    for (const match of matches) {
      const startIndex = match.index ? match.index : target.lastIndexOf(match[0]);
      if (startIndex === -1) continue;
      this.matchIndexes.push({ start: startIndex, end: startIndex + match[0].length, countForChildFiltering });
    }

    if (returnAll) return matches;
    return matches[matches.length - 1];
  }

  /**
   * Get the first match index in the input.
   * For example, in "My Movie 2019", the first match would be the
   * index of the start of "2019" as that is an extracted year.
   * @param afterIndex Get the first match that is after this index.
   */
  protected firstMatchIndex(afterIndex?: number): number | undefined {
    this.matchIndexes.sort((a, b) => a.start - b.start);
    if (afterIndex === undefined) return this.matchIndexes[0]?.start;
    // checking the end here is important and intentional, otherwise
    // for example file name extraction might fail if a match crosses path parts.
    return this.matchIndexes.find((m) => m.countForChildFiltering && afterIndex < m.end)?.start;
  }

  /**
   * Get the best search result for the given title.
   * For episodes we will look up the series title, TitleType.EPISODE is aliased to TitleType.SERIES.
   */
  protected async getIMDBResult(data: Partial<ApolloOutput>): Promise<SearchResult | undefined> {
    if (!data.title) throw new Error('Missing "data.title"');
    if (data.titleType === undefined) {
      this.log?.debug(`Cannot search without resolved title type.`);
      return;
    }

    this.log?.debug(`Searching IMDb for "${data.title}"`);
    const results = await this.search(data.title);
    const filtered: SearchResult[] = [];
    const expectType = data.titleType === TitleType.EPISODE ? TitleType.SERIES : data.titleType;
    for (const result of results) {
      // ignore titles that don't match the expected type
      if (expectType !== result.type) continue;
      // ignore movies that don't match the extracted year (if any)
      if (data.titleType === TitleType.MOVIE && data.startYear && result.year && result.year !== data.startYear) continue;
      // imdb tends to return random results with extremely long names
      // when it has no clue what you're after. this avoids those results.
      // its *3 because *2 might not match "the fellowship of the ring" to "the lord of the rings: the fellowship of the ring"
      if (result.name.length > data.title.length * 3) continue;
      filtered.push(result);
    }

    if (!data.title.includes(" ")) {
      // with single-word titles, i've found IMDb struggles sometimes,
      // for example returning "Logan Lucky (2017)" before "Logan (2017)". This is a hacky way
      // to get around that.
      const haystack = filtered.slice(0, 4);
      const lowerTitle = data.title.toLowerCase();
      for (const item of haystack) {
        if (item.name.toLowerCase() === lowerTitle) return item;
      }
    }

    return filtered.shift();
  }

  private getExtensionAndFileType(input: string): { extension: string; fileType: FileType } | undefined {
    const haystack = input.toLowerCase();
    const videoExtension = VIDEO_EXTENSIONS.find((ext) => haystack.endsWith(ext));
    if (videoExtension) {
      return { extension: videoExtension, fileType: FileType.Video };
    }

    const imageExtension = IMAGE_EXTENSIONS.find((ext) => haystack.endsWith(ext));
    if (imageExtension) {
      return { extension: imageExtension, fileType: FileType.Image };
    }

    const subtitleExtension = SUBTITLE_EXTENSIONS.find((ext) => haystack.endsWith(ext));
    if (subtitleExtension) {
      return { extension: subtitleExtension, fileType: FileType.Subtitle };
    }
  }
}
