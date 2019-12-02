# apollo

Apollo converts your downloads folder into a delicious structured library for Plex or our own viewing pleasure.

This is not a replacement for [filebot](filebot.net). If all you're doing is renaming your legally obtained media into a more usable directory structure, then Apollo should do the job. If you want better support, more features, more customisability, an actual community to help you and better reliability then you should at least try filebot first.

# installation

_I'm still testing Apollo. As soon as I trust it with other peoples files, I'll put up a proper installation guide. That said, here's a rough guide..._

- Make sure you have a reasonably up-to-date version of [Node.js](https://nodejs.org/en/) installed (tested with v12.10)
- Clone this repo
- `cd apollo`
- Install dependencies, `yarn install` or `npm install`
- Build Apollo, `yarn run build` or `npm run build`
- Link apollo, `yarn run link` or `npm run link`

# usage

`apollo --help`

# goals

- Speed is key
  - Other renamers are slow due to individually requesting information from external sources. This can take a lot of time when you have hundreds of videos to process and live far from the origin server.
- No network dependencies
  - Network dependencies including movie or TV databases are used by other renamers to get detailed data about TV shows. In my opinion, this is a pointless use of resources if you're only sorting your library so Plex or another application can pick it up. If you're sorting your library because you want to view it, you can still get away with using the data in the file names or paths. The only data you might miss is episode names.
- Plex should understand the output
  - Otherwise whats the point?

# caveats

- Apollo will ignore file paths.
  - If you have movies in a structure like `My Epic Movie (2019) (1080p)/movie.mp4`, Apollo will only look at `movie.mp4` for data.
- File names lacking data will be logged and ignored.
  - Given `S16E01 Emmy-Winning Episode[1080p Web x265][MP3 5.1].mp4`, Apollo will log an error and skip over the file because it could not extract the parent title's name, which would be "Family Guy". Given the full path, a human could get enough information about the file to guess what the parent title's name is, but that would overcomplicate the process and the original point was to be simple and fast.
- Ambiguous file names can confuse Apollo.
  - Given `Family Guy Blue Harvest 2007 [1080p BluRay H265][MP3 5.1].mp4`, Apollo will think this file is a movie due to it not having a season or episode number. In reality, [IMDb classes this title as a TV show](https://www.imdb.com/title/tt0888817/).

# what apollo can do today

See [src/parser/index.spec.ts](src/parser/index.spec.ts) for everything the parser is tested against.

# what apollo might be able to do in the future

- [ ] Support for moving instead of symlinking
  - [ ] "Recovery" files that can be used to restore moved files to their original or a new location.
- [ ] Look at parent directories to see if we can find more metadata about the file when missing.
  - This would complicate the whole parsing process, so I'm personally against it.
- [ ] Allow files to be renamed without duplicating them the next time Apollo runs
  - My approach would be to read the output directory structure, build a map with keys being file sizes and original paths or names. When writing, if the map contains a file with the same size and/or same original name/path, skip writing and assume the user intervened or the file already exists.
