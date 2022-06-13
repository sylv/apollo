# apollo

A library to parse file names into structured data. Optionally it can rename files like [filebot](https://www.filebot.net/).

# installation

_there are still lots of bugs to iron out. Stick with the default symlinking behaviour and double-check that it moved everything. If you find a problem, please open an issue._

Requires the current [Node.js](https://nodejs.org/en/) LTS

## command line

```bash
npm install -g @ryanke/apollo
```

```bash
# list options
apollo --help
# scan ./downloads and create symlinks to media in ./library
apollo ./downloads ./library
```

## programmatic

```bash
# with npm
npm install @ryanke/apollo
# with yarn
yarn add @ryanke/apollo
```

```ts
import { ApolloParser } from "@ryanke/apollo";

const parsed = [];
const input = ["The.Walking.Dead.S01-S07.Season.1-7.1080p.10bit.BluRay.5.1.x265.HEVC", "Bob's Burgers 2011 SE 1 - 8 Complete WEBRIP/SE1/09 Spaghetti Western and Meatballs.mp4"];

for (const title of input) {
  // creating a new instance of the parser on each run is important
  // there is match data attached to the parser instance once you run .parse()
  const parser = new ApolloParser();
  const output = await parser.parse(title);
  parsed.push(output);
}

console.log(output);

// The output of the above script will look similar to this
// [{
//     fileType: 'MEDIA',
//     audio: [ '5.1' ],
//     collection: true,
//     languages: [],
//     resolution: { height: 1080 },
//     seasons: [
//         1, 2, 3, 4,
//         5, 6, 7
//     ],
//     quality: 'BluRay',
//     coding: [ '10bit', 'x265', 'HEVC' ],
//     type: 1,
//     title: 'The Walking Dead',
//     imdb: IMDBTitlePartial<tt1520211>
// },
// {
//     extension: '.mp4',
//     fileType: 'MEDIA',
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
//     type: 2,
//     title: "Bob's Burgers",
//     imdb: IMDBTitlePartial<tt1561755>
// }]
```

# todo

- [ ] Directories with multiple subtitles in different languages for the same file like `movie.mp4`, `movie.eng.sub`, `movie.rus.sub` aren't handled correctly and will move the subtitle file we first see as `movie.sub` and leave the rest behind. We could handle this by using something like the `languagedetect` library on the subtitles, as well as trying to extract a title code from the file.
- [ ] Customisable output directory structure, instead of the default `Movies/Movie (year)/Movie (year).ext`
- [ ] Extraction of episode names. Shouldn't be hard with the current title extraction.
- [ ] Option to preserve file names instead of converting them to a standard format as some programs require the original file names.
- [ ] Support IMDb datasets for faster and more reliable searches. Relying on an internal API is a bad idea.
