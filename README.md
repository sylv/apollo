> **Warning**
> Apollo works, but with edge cases it can struggle a lot. I'm working on a different and more general approach using machine learning that can handle any path and extract clean, usable metadata but that's gonna take awhile. In the meantime, it does fine for most formats.

# apollo

A library to parse file names into structured data. Also provides a cli to rename/symlink files based on the extracted data like [filebot](https://filebot.net). You can see the inputs Apollo can handle and what it returns for them in [parser.test.ts.snap](./test/__snapshots__/parser.test.ts.snap).

## command line usage

_there are still a lot of bugs with apollo, you should stick wtih symlinks when possible and always have snapshots enabled_

```bash
npm install -g @ryanke/apollo
```

```bash
apollo --help # list options, also includes exampels and documentation

# there are two ways to organise files automatically
apollo link ./downloads ./library # scan ./downloads and create symlinks to media in ./library
apollo move ./downloads ./library # scan ./downloads and move media to ./library

# rollbacks can be used to undo changes made by link/move
# this is done using a best-effort attempt and may leave some empty directories in the output
# history is stored in ~/.config/apollo/snapshots.db by default
# run multiple times to go back multiple invocations
apollo rollback ./downloads
# this will move files from ./library back to their original locations in ./downloads
# for symlinks, all it does is unlink the destinations
```

## programmatic usage

```bash
# with npm
npm install @ryanke/apollo
# with yarn
yarn add @ryanke/apollo
# with pnpm
pnpm add @ryanke/apollo
```

```ts
import { ApolloParser } from "@ryanke/apollo";

const parsed = [];
const input = [
  "Deadpool 2016 1080p BluRay x264 DTS-JYK/Subs/French.srt",
  "The.Walking.Dead.S01-S07.Season.1-7.1080p.10bit.BluRay.5.1.x265.HEVC",
  `Bob's Burgers 2011 SE 1 - 8 Complete WEBRIP/SE1/09 Spaghetti Western and Meatballs.mp4`,
  `/home/data/readonly/Group Trip/videos/Some Interesting Video-1.mp4`,
];

for (const title of input) {
  // creating a new instance of the parser on each run is important
  // there is match data attached to the parser instance once you run .parse()
  const parser = new ApolloParser({
    // providers are used to lookup additional information about titles.
    // the order is also used for priority, in this example if the local provider has no search results we fall back to imdb.
    // "imdb" will use the undocumented IMDb search API, it is quite fast but does not include some extra info like episode names
    // "local" uses a local database generated by scripts/generate-titles-db.ts in data/titles.db, it is extremely fast.
    // the local database is automatically updated every ~6 days. search results are sometimes lower quality but there is additional information
    // like episode names, end years, etc that can contribute to higher quality matches.
    providers: ["local", "imdb"],
  });

  const output = await parser.parse(title);
  parsed.push(output);
}

console.log(parsed);
// The output of the above script will look similar to this
// [
//   {
//     extension: '.srt',
//     fileType: 'SUBTITLE',
//     audio: [],
//     collection: false,
//     languages: [ 'fr' ],
//     resolution: { width: null, height: 1080 },
//     startYear: 2016,
//     quality: 'BluRay',
//     coding: [ 'x264' ],
//     releaseGroup: 'JYK',
//     titleType: 0,
//     name: 'Deadpool',
//     imdbId: 'tt1431045',
//     links: [
//       {
//         name: 'IMDb',
//         id: 'tt1431045',
//         url: 'https://imdb.com/title/tt1431045'
//       }
//     ]
//   },
//   {
//     extension: undefined,
//     fileType: 'VIDEO',
//     audio: [ '5.1' ],
//     collection: true,
//     languages: [],
//     resolution: { width: null, height: 1080 },
//     seasons: [
//       1, 2, 3, 4,
//       5, 6, 7
//     ],
//     quality: 'BluRay',
//     coding: [ '10bit', 'x265', 'HEVC' ],
//     titleType: 1,
//     name: 'The Walking Dead',
//     imdbId: 'tt1520211',
//     startYear: 2010,
//     endYear: 2022,
//     links: [
//       {
//         name: 'IMDb',
//         id: 'tt1520211',
//         url: 'https://imdb.com/title/tt1520211'
//       }
//     ]
//   },
//   {
//     extension: '.mp4',
//     fileType: 'VIDEO',
//     audio: [],
//     collection: true,
//     languages: [],
//     seasonNumber: 1,
//     episodeNumber: [ 9 ],
//     seasons: [
//       1, 2, 3, 4,
//       5, 6, 7, 8
//     ],
//     startYear: 2011,
//     coding: [],
//     titleType: 3,
//     name: "Bob's Burgers"
//   },
//   {
//     extension: '.mp4',
//     fileType: 'VIDEO',
//     audio: [],
//     collection: false,
//     languages: [],
//     coding: [],
//     index: 1,
//     name: 'Group Trip/Some Interesting Video'
//   }
// ]
```

# todo

- [ ] Test for extracting languages from subtitle filenames more, maybe specific regex to match it.
- [ ] Merge `seasons` and `seasonNumber` properties into `seasonNumbers`, a getter for `seasonNumber` that returns null when there is more than one season
- [ ] Merge season+episode/season/episode property extractors into one extractor
- [ ] Extract episode names
- [ ] `apollo snapshots` to list snapshots
- [ ] `apollo snapshots --prune` to remove old snapshots
- [ ] Store created directories in snapshots so we can delete them after
  - Alternatively, `--delete-empty-dirs` could work with `rollback`
- [ ] Process multiple files at once and make better assumptions about them.
  - We would have to ensure the names match across all files in the batch, this should only be useful with season packs.
  - Things like episode vs title names would be easier because episode names would change between files where titles would not, so we could have better confidence with episode names and other data.
- [ ] Split extracted info into episode and title sections. For example, `startYear` and `poster` is ambiguous as to whether it belongs to the title or individual episode.
- [ ] Support importing featurettes
