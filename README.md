# apollo

Apollo is a tool to organise your media library. It's intended to be a faster, more reliable alternative to [FileBot](https://filebot.net). Using the undocumented IMDb search API, we can do fast title searches to get accurate names for your library.

# installation

_Apollo is still experimental. I encourage you to try it out and compare it to filebot. Stick with symlinking so you don't destroy your library and report any issues you find. This is still a rough guide._

Requires [Node.js](https://nodejs.org/en/) >=12.0.0

```bash
git clone https://github.com/sylv/apollo.git
cd apollo
npm install
npm run build
npm run link
apollo --version
```

# usage

## command line

```bash
apollo --help
apollo ./torrents ./library
```

## programmatic

```json
"dependencies": {
    "apollo": "git+https://github.com/sylv/apollo.git",
    ...
}
```

```ts
import { ApolloParser } from "apollo";

// use different parser instances for each input,
// otherwise previous inputs will corrupt the output.
const torrentNameParser = new ApolloParser();
const filePathParser = new ApolloParser();
const torrentNameData = await torrentNameParser.parse(`The.Walking.Dead.S01-S07.Season.1-7.1080p.10bit.BluRay.5.1.x265.HEVC`);
const filePathData = await filePathParser.parse(`Bob's Burgers 2011 SE 1 - 8 Complete/SE1/09 Spaghetti Western and Meatballs.mp4`);
console.log({ torrentNameData, filePathData });
// see src/parser.spec.ts for more utterly horrifying inputs that mostly work.
// {
//     title: "Bob's Burgers",
//     type: apollo.TitleType.TV,
//     collection: true,
//     extension: ".mp4",
//     fileType: apollo.FileType.MEDIA,
//     startYear: 2011,
//     languages: [],
//     audio: [],
//     seasonNumber: 1,
//     episodeNumber: 9,
// }
```

# todo

- [ ] Directories with multiple subtitles in different languages for the same file like `movie.mp4`, `movie.eng.sub`, `movie.rus.sub` aren't handled correctly and will move the subtitle file we first see as `movie.sub` and leave the rest behind.
- [ ] Customisable output directory structure, instead of the default `Movies/Movie (year)/Movie (year).ext`
