declare function rrdir(dir: string, options?: rrdir.Options): AsyncIterableIterator<rrdir.Entry>;
declare namespace rrdir {
  function sync(dir: string, options?: rrdir.Options): rrdir.Entry[];
  function async(dir: string, options?: rrdir.Options): Promise<rrdir.Entry[]>;

  export interface Options {
    exclude?: string[];
    include?: string[];
    strict?: boolean;
    encoding?: string;
    match?: any;
    stats: boolean;
    followSymlinks?: boolean;
  }

  export interface Entry {
    path: string;
    directory: boolean;
    symlink: boolean;
    stats?: import("fs").Stats;
    err: Error;
  }
}

export = rrdir;
