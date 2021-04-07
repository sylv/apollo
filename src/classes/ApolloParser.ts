import { IMDB, IMDBTitlePartial, IMDBTitleType } from "@ryanke/imdb-api";
import mem from "mem";
import { cleanFilePath } from "../helpers/cleanFilePath";
import { cleanRawTitle } from "../helpers/cleanRawTitle";
import { Logger } from "tslog";
import { properties } from "../properties/index";
import { apollo } from "../types";
import { ALL_EXTENSIONS, SUBTITLE_FILE_EXTENSIONS } from "../constants";
import { getAllMatches } from "../helpers/getAllMatches";

export class ApolloParser {
  protected matchIndexes: { start: number; end: number }[] = [];
  protected imdb = new IMDB();
  protected search = mem(this.imdb.search);
  protected log?: Logger;
  readonly options: apollo.ParserOptions;
  constructor(options: apollo.ParserOptions = {}) {
    this.options = options;
    this.log = this.options.logger;
  }

  /**
   * Parse a torrent name or complete path.
   */
  public async parse(input: string, parentData?: Partial<apollo.Parsed>): Promise<apollo.Parsed | undefined> {
    const extension = parentData ? parentData.extension : ALL_EXTENSIONS.find((ext) => input.endsWith(ext));
    const fileType = extension && SUBTITLE_FILE_EXTENSIONS.includes(extension) ? apollo.FileType.SUBTITLE : apollo.FileType.MEDIA;
    const data: Partial<apollo.Parsed> = Object.assign({}, parentData, { extension, fileType });
    const inputWithoutExt = extension && input.endsWith(extension) ? input.slice(0, -extension.length) : input;
    const cleanPath = cleanFilePath(inputWithoutExt);
    if (!cleanPath) {
      this.log?.debug(`Skipping "${input}" as it contains undesirable keywords`);
      return;
    } else {
      this.log?.debug(`Cleaned path is "${cleanPath}"`);
    }

    this.parseProperties(cleanPath, data);
    this.parseType(data);

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

    data.title = this.extractTitleFromPath(cleanPath);
    if (data.title && !this.options.disableLookup) {
      const result = await this.getIMDBResult(data);
      if (result) {
        this.log?.debug(`Resolved "${data.title}" to "${result.name}" ${result.link}`);
        data.title = result.name;
        data.imdb = result;
      } else {
        this.log?.debug(`No valid results for "${data.title}"`);
      }
    }

    return data as apollo.Parsed;
  }

  /**
   * Run property parsers in the properties/ directory and add the extracted data to the provided data object.
   */
  protected parseProperties(cleanPath: string, data: Partial<apollo.Parsed>) {
    for (const property of properties) property.write(cleanPath, data, this);
    return data;
  }

  /**
   * Parse the type of title based on extracted properties.
   * data.type will be undefined if the type is unclear.
   */
  protected parseType(data: Partial<apollo.Parsed>) {
    if (data.episodeNumber?.length) data.type = IMDBTitleType.EPISODE;
    else if (data.seasons?.length || data.episodes?.length || data.seasonNumber !== undefined) data.type = IMDBTitleType.SERIES;
    else if (data.startYear && !data.endYear) data.type = IMDBTitleType.MOVIE;
    else this.log?.debug(`Cannot resolve title type based on parsed properties.`);
  }

  /**
   * Try extract the title from the cleaned file path.
   * This basically works by finding the longest string between matches,
   * so we have to match as much data as possible for accurate title extraction.
   * it will also try extact an episode name.
   */
  protected extractTitleFromPath(cleanPath: string): string | undefined {
    let previous = 0;
    const parts = [];
    const matches = this.matchIndexes.sort((a, b) => a.start - b.start);
    // we add an extra +1 because otherwise episode names won't be extracted if there isnt a match after them.
    // basically we have to do a final loop that extracts from the last match to the end of the string if
    // there isnt a match at the very end.
    for (let i = 0; i < matches.length + 1; i++) {
      const match = matches[i];
      const start = match?.start ?? cleanPath.length;
      const end = match?.end ?? cleanPath.length;
      if (previous >= start) {
        previous = end;
        continue;
      }

      const raw = cleanPath.substring(previous, start);
      const index = cleanPath.indexOf(raw);
      const title = cleanRawTitle(raw);
      // titles not near the start likely aren't relevant and are just random gibberish like
      // an episode name.
      // todo: extracting the episode name would actually be very poggers.
      if (index > 5) continue;
      if (title) parts.push({ index, title });
      previous = end;
    }

    // todo: at the moment we're just using the first one as it works pretty much every time
    // with collection handling that skips some parts of the path so we don't mismatch names.
    // it might be worth making this a bit more elaborate? maybe picking the most popular
    // result or something?
    this.log?.debug(`Extracted title candidates`, parts);
    return parts.shift()?.title;
  }

  /**
   * Get a match from a string. This automatically handles pushiung to this.matchIndexes and
   * multiple matches for you and most of the time should be preferred over string.match or RegExp.exec.
   */
  public getMatch(target: string, pattern: RegExp, returnAll: true): RegExpExecArray[];
  public getMatch(target: string, pattern: RegExp, returnAll: false): RegExpExecArray | undefined;
  public getMatch(target: string, pattern: RegExp, returnAll: boolean): RegExpExecArray | RegExpExecArray[] | undefined {
    const matches = getAllMatches(target, pattern);
    for (const match of matches) {
      const startIndex = match.index ? match.index : target.lastIndexOf(match[0]);
      if (startIndex === -1) continue;
      this.matchIndexes.push({ start: startIndex, end: startIndex + match[0].length });
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
    return this.matchIndexes.find((m) => afterIndex < m.end)?.start;
  }

  /**
   * Get the best search result for the given title.
   * For episodes we will look up the series title, IMDBTitleType.EPISODE is aliased to IMDBTitleType.SERIES.
   */
  protected async getIMDBResult(data: Partial<apollo.Parsed>): Promise<IMDBTitlePartial | undefined> {
    if (!data.title) throw new Error('Missing "data.title"');
    if (data.type === undefined) {
      this.log?.debug(`Cannot search without resolved title type.`);
      return;
    }

    this.log?.debug(`Searching IMDb for "${data.title}"`);
    const results = await this.search(data.title);
    const filtered: IMDBTitlePartial[] = [];
    const expectType = data.type === IMDBTitleType.EPISODE ? IMDBTitleType.SERIES : data.type;
    for (const result of results) {
      // ignore titles that don't match the expected type
      if (expectType !== result.type) continue;
      // ignore movies that don't match the extracted year (if any)
      if (data.type === IMDBTitleType.MOVIE && data.startYear && result.year && result.year !== data.startYear) continue;
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
}
