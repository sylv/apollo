export namespace apollo {
  // using strings instead of numbers makes it easier to debug when apollo
  // is on the operating table.
  export enum TitleType {
    MOVIE = "MOVIE",
    TV = "TV"
  }

  export enum FileType {
    MEDIA = "MEDIA",
    SUPPORTING = "SUPPORTING"
  }

  export interface LookupResult {
    title: string;
    year?: number;
    rank: number;
    type: TitleType;
    poster?: string;
  }

  export interface Match {
    value: string;
    index: number;
  }

  export interface Options {
    input: string;
    output: string;
    move: boolean;
    dryRun: boolean;
    minSize: number;
  }

  export interface Parsed {
    title: string;
    resolution?: number;
    type: TitleType;
    fileType: FileType;
    collection: boolean;
    seasonNumber?: number;
    episodeNumber: number[];
    extension: string;
    startYear?: number;
    endYear?: number;
    languages: string[];
    audio: string[];
  }
}
