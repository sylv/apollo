# apollo

Apollo converts your downloads folder into a delicious structured library for Plex or our own viewing pleasure.

This is not a replacement for [filebot](https://filebot.net). If all you're doing is renaming your legally obtained media into a more usable directory structure, then Apollo should do the job. If you want better support, more features, more customisability, an actual community to help you and better reliability then you should at least try filebot first.

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
- No network dependencies
  - Pinging an outside network with a list of everything you have in your library is both slow and bad for privacy. There is a good chance your media player of choice (Plex, Emvy, Jellyfin) will lookup the titles in your library for you.
- Plex should pick up the output structure and correctly import titles

# caveats

- Apollo will ignore parent directories.
  - If you have movies in a structure like `My Epic Movie (2019) (1080p)/movie.mp4`, Apollo will only look at `movie.mp4` for data.
- Ambiguous file names can confuse Apollo.
  - Given `Family Guy Blue Harvest 2007 [1080p BluRay H265][MP3 5.1].mp4`, Apollo will think this file is a movie due to it not having a season or episode number. In reality, [IMDb classes this title as a TV show](https://www.imdb.com/title/tt0888817/).

# what apollo can do today

See [src/parser/index.spec.ts](src/parser/index.spec.ts) for everything the parser is tested against.

# what apollo might be able to do in the future

- [ ] Support for moving instead of symlinking
- [ ] "Recovery" files that can be used to restore moved files to their original or a new location.
- [ ] Allow files to be renamed without duplicating them the next time Apollo runs
- [ ] Subtitle files should have their language as an extension - e.g `Batman Begins (2005).eng.srt`
- [ ] Have a local "slim" copy of [IMDB Interfaces](https://www.imdb.com/interfaces/) for fast lookups of proper title names. SQLite with FTS should suffice.
