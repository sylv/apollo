# apollo

Apollo is a tool to organise your media library. It uses the undocumented IMDb Search API for fast and reliable title lookups.
This is still experimental, so installation and usage is vague.

# to-do

- [ ] Subtitles are not handled correctly. They should have their language in the path.

# command-line use

```bash
apollo ./torrents ./library
```

# programmatic usage

```ts
import apollo from "apollo";

const torrentNameData = await apollo.parse(`The.Walking.Dead.S01-S07.Season.1-7.1080p.10bit.BluRay.5.1.x265.HEVC`);
const filePathData = await apollo.parse(`Bob's Burgers 2011 SE 1 - 8 Complete/SE1/09 Spaghetti Western and Meatballs.mp4`);
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
