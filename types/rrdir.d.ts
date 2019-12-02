declare function rrdir(dir: string, options?: rrdir.Options): Promise<rrdir.Entry[]>;
declare namespace rrdir {
  function sync(dir: string, options?: rrdir.Options): rrdir.Entry[];
  function stream(dir: string, options?: rrdir.Options): AsyncIterable<rrdir.Entry>;

  interface BaseOptions {
    stats?: boolean;
    exclude?: string[];
    include?: string[];
    strict?: boolean;
    encoding?: string;
    minimatch?: import('minimatch').IOptions;
  }

  interface StatOptions extends BaseOptions {
    stats: true;
    followSymlinks?: boolean;
  }

  type Options = BaseOptions | StatOptions;

  export interface Entry {
    path: string;
    directory: boolean;
    symlink: boolean;
    stats?: import('fs').Stats;
    err: Error;
  }
}

export = rrdir;
