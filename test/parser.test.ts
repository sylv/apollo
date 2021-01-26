import { apollo } from "../src/types";
import { ApolloParser } from "../src/parser";
import { IMDBTitleType } from "@ryanke/imdb-api";

const tests: ((apollo.Parsed & { input: string }) | { input: string })[] = [
  {
    // Another multi pack that borks things occasionally.
    input:
      "The Simpsons (1989-2018) Seasons 01-29 & Movie [1080p] [Ultimate Batch] [HEVC] [x265] [pseudo]/Season 07/The Simpsons - S07E25 - Summer of 4 Ft 2 [1080p] [x265] [pseudo].mkv",
    title: "The Simpsons",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 7,
    episodeNumber: [25],
  },
  {
    // Not having the season number in the file name caused huge issues for the original parser
    // that only checked file names.
    // The current parser handles this reasonably well with a simple pattern, this tests specifically
    // for that pattern.
    input: "Bob's Burgers 2011 SE 1 - 8 Complete Eng Only Burntodisc/SE1/02 Human Flesh.mp4",
    title: "Bob's Burgers",
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    startYear: 2011,
    languages: [],
    audio: [],
    seasonNumber: 1,
    episodeNumber: [2],
  },
  {
    // Another bag of worms test.
    // * Multiple titles in the parent directory name
    // * When defaulting to the filename alone to deal with the above issue, we only get a partial name.
    // * Generally a pain in the ass.
    input:
      "The Hobbit & The Lord of The Rings Extended Trilogy 1080p 10bit BluRay x265 HEVC MRN/The Lord of The Rings Trilogy Extended Cut 1080p 10bit BluRay x265 HEVC 6CH -MRN/1-Fellowship.of.The.Ring.2001.Extended.Cut.1080p.10bit.BluRay.x265.HEVC.6CH-MRN.mkv",
    title: "The Lord of the Rings: The Fellowship of the Ring",
    resolution: 1080,
    type: IMDBTitleType.MOVIE,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: 2001,
    languages: [],
    audio: [],
    episodeNumber: [],
  },
  {
    // space between "S03 E11" meant the whole match was thrown out.
    input:
      "Z:\\torrents\\completed\\The EXPANSE - Complete Season 3 S03 (2018) - 1080p AMZN Web-DL x264\\The EXPANSE - S03 E11 - Fallen World (1080p - AMZN Web-DL).mp4",
    title: "The Expanse",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 3,
    episodeNumber: [11],
  },
  {
    // season ranges, "1x01" season/episode formats
    input: "/mnt/z/torrents/completed/American Dad S01 - S13/Season 13/American Dad! - 13x04 - N.S.A. (No Snoops Allowed).mkv",
    title: "American Dad!",
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 13,
    episodeNumber: [4],
  },
  {
    // "1x01" season/episode formats
    input: "/mnt/z/torrents/completed/American Dad S01 - S13/Season 10/American Dad! - 10x04 - Crotchwalkers.mkv",
    title: "American Dad!",
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 10,
    episodeNumber: [4],
  },
  {
    // testing series aliases
    input: "Avatar (TLoK) - S03 E12 - Enter the Void (1080p - BluRay).mp4",
    title: "The Legend of Korra",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 3,
    episodeNumber: [12],
  },
  {
    // similar issues to the Republic City Hustle test from the same series below.
    input:
      "AVATAR Series (2005-2014) - COMPLETE The Last Airbender, 2010 Movie, Legend of Korra - 1080p BluRay x264\\2. The Legend of Korra (2012-14)\\Book 4a - Balance (2014)\\Avatar (TLoK) - S04 E10 - Operation Beifong (1080p - BluRay).mp4",
    title: "The Legend of Korra",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 4,
    episodeNumber: [10],
  },
  {
    // that one scene where nicholas cage steps off the plane and his stunning, silky hair is blowing in the wind
    // should be reason enough to put this as a test.
    input: "/mnt/z/torrents/completed/ConAir.1997.720p.BluRay.x264.AC3-RiPRG/ConAir.1997.720p.BluRay.x264.AC3-RiPRG.mkv",
    title: "Con Air",
    resolution: 720,
    type: IMDBTitleType.MOVIE,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: 1997,
    languages: [],
    audio: ["AC3", "AC3"],
    episodeNumber: [],
  },
  {
    // The multi-collection pack was annoying at times.
    // "Part 2", the "2" is really the only indicator in the title between part 1 and part 2.
    // This is also a good test for the "Legend of Korra Republic City Hustle" hack below, to make sure
    // it doesn't think anything matching "Part N" is a season.
    input:
      "Z:\\torrents\\completed\\The Hunger Games 4 Film Complete Collection 1080p BluRay 5.1Ch x265 HEVC SUJAIDR\\The Hunger Games Mockingjay Part 2 (2015) 1080p BluRay 5.1Ch x265 HEVC SUJAIDR.mkv",
    title: "The Hunger Games: Mockingjay - Part 2",
    resolution: 1080,
    type: IMDBTitleType.MOVIE,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: 2015,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: undefined,
    episodeNumber: [],
  },
  {
    // surprisingly this one hasn't caused any issues yet, though I figure it's a good test
    // due to the name "2012" potentially being mistaken for a year.
    input: "Z:\\torrents\\completed\\2012 (2009) [1080p]\\2012.2009.BluRay.1080p.x264.YIFY.mp4",
    title: "2012",
    resolution: 1080,
    type: IMDBTitleType.MOVIE,
    collection: false,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    startYear: 2009,
    languages: [],
    audio: [],
    episodeNumber: [],
  },
  {
    // this just generally seemed like a good test.
    // also the prefix, [TorrentCouch.com] borked things a little at times.
    input:
      "Z:\\torrents\\completed\\[TorrentCouch.com].Silicon.Valley.S05.Complete.720p.BRRip.x264.ESubs.[1.6GB].[Season.5.Full]\\[TorrentCouch.com].Silicon.Valley.S05E01.720p.BRRip.x264.ESubs.mkv",
    title: "Silicon Valley",
    resolution: 720,
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 5,
    episodeNumber: [1],
  },
  {
    // this one is just straight nasty.
    // * The first issue was that there are about 15 different title names in the main parent directory name, the reasoning for falling back to the file name
    // alone when we were unsure.
    // * The second issue was that once we got the right name, "Avatar (TLoK)" has no search results. This is resolved by series aliases in constants.ts.
    // * The third issue was the year ranges, "2012-2014", and the fact that there are multiple year names. This led to preferring matches towards the end
    // of the string.
    // * The fourth issue was "Part 3 of 3" - these are shorts, but gets around the size limit by being 100mb. The solution was to treat it as an
    // "Unknown Season" and have part 3 of 3 indicate the episode number.
    input:
      "Z:\\torrents\\completed\\AVATAR Series (2005-2014) - COMPLETE The Last Airbender, 2010 Movie, Legend of Korra - 1080p BluRay x264\\2. The Legend of Korra (2012-14)\\Book 2a - Republic City Hustle (2013)\\Avatar (TLoK) - Republic City Hustle, Part 3 of 3 (1080p).mp4",
    title: "The Legend of Korra",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    episodeNumber: [3],
  },
  {
    // brackets around season index
    input: "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 7/Top Gear - [07x06] - 2005.12.27 [GOTHiC].avi",
    title: "Top Gear",
    resolution: undefined,
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".avi",
    fileType: apollo.FileType.MEDIA,
    startYear: 2005,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: 7,
    episodeNumber: [6],
  },
  {
    // IMDB results would give another longer movie name, which is why we now prefer exact matches when there are no spaces.
    input: "/mnt/z/torrents/completed/Logan (2017) [1080p] [YTS.AG]/Logan.2017.1080p.BluRay.x264-[YTS.AG].mp4",
    title: "Logan",
    resolution: 1080,
    type: IMDBTitleType.MOVIE,
    collection: false,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    startYear: 2017,
    languages: [],
    audio: [],
    episodeNumber: [],
  },
  {
    // (auto) prefix fucked things up
    input:
      "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 10/(auto) Top Gear - 10.07.2008 - [10x01] - [Greatest road in EU].avi",
    title: "Top Gear",
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".avi",
    fileType: apollo.FileType.MEDIA,
    startYear: 2008,
    languages: [],
    audio: [],
    seasonNumber: 10,
    episodeNumber: [1],
  },
  {
    // previous season parsers would look up "Love Death and Robots S01", which is why ApolloParser#getMatches() works how it  do
    input:
      "/mnt/z/torrents/completed/Love.Death.and.Robots.S01.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus/Love.Death.and.Robots.1x01.Il.Vantaggio.di.Sonnie.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus.mkv",
    title: "Love, Death & Robots",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: ["ITA", "ENG", "ITA", "ENG"],
    audio: [],
    seasonNumber: 1,
    episodeNumber: [1],
  },
  {
    // looking up this title would get invalid results.
    input:
      "/mnt/z/torrents/completed/Watchmen.S01.COMPLETE.720p.AMZN.WEBRip.x264-GalaxySERIES[TGx]/Watchmen.S01E01.720p.AMZN.WEBRip.x264-GalaxySERIES.mkv",
    title: "Watchmen",
    resolution: 720,
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 1,
    episodeNumber: [1],
  },
  {
    // had issues with the brackets in [11x01] and the full date "2008.06.22"
    input:
      "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 11/(auto) Top Gear - 2008 - [11x01] - 2008.06.22 [$1k cop car].avi",
    title: "Top Gear",
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".avi",
    fileType: apollo.FileType.MEDIA,
    startYear: 2008,
    languages: [],
    audio: [],
    seasonNumber: 11,
    episodeNumber: [1],
  },
  {
    // the dash in "S01e01-10" really fucked with the parser.
    input: "/mnt/z/Archer S01e01-10/Archer.1x05.Honeypot.1080p.BDMux.ITA.ENG.Subs.x264-Fratposa.mkv",
    title: "Archer",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: undefined,
    endYear: undefined,
    languages: ["ITA", "ENG"],
    audio: [],
    seasonNumber: 1,
    episodeNumber: [5],
  },
  {
    // good test for confusing "Se7en" as "Season 7"
    input: "Se7en.1995.REMASTERED.1080p.BluRay.10bit.HEVC.6CH.MkvCage.ws.mkv",
    title: "Se7en",
    resolution: 1080,
    type: IMDBTitleType.MOVIE,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: 1995,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: undefined,
    episodeNumber: [],
  },
  {
    // good test for dots
    input: "/home/ryan/clone/Family Guy - Complete H265/Season 17 [1080p x265][MP3 5.1]/Family.Guy.S17E16 [1080p Web x265][MP3 5.1].mp4",
    title: "Family Guy",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    startYear: undefined,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: 17,
    episodeNumber: [16],
  },
  {
    // the www.Torrenting.org had to be filtered out
    input:
      "Z:\\clone-2\\www.Torrenting.org       The Mandalorian S01E01 INTERNAL 1080p WEB H264-DEFLATE\\The.Mandalorian.S01E01.INTERNAL.1080p.WEB.H264-DEFLATE.mkv",
    title: "The Mandalorian",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: undefined,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: 1,
    episodeNumber: [1],
  },
  {
    input: "Y:\\completed\\Deadpool 2016 1080p BluRay x264 DTS-JYK\\Subs\\French.srt",
    title: "Deadpool",
    resolution: 1080,
    type: IMDBTitleType.MOVIE,
    collection: false,
    extension: ".srt",
    fileType: apollo.FileType.SUPPORTING,
    startYear: 2016,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: undefined,
    episodeNumber: [],
  },
  {
    input:
      "The Simpsons (1989-2018) Seasons 01-29 & Movie [1080p] [Ultimate Batch] [HEVC] [x265] [pseudo]/Season 28/The Simpsons - S28E12E13 - The Great Phatsby [1080p] [x265] [pseudo].mkv",
    title: "The Simpsons",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: undefined,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: 28,
    episodeNumber: [12, 13],
  },
  {
    // support for "0" episode numbers
    // this isn't the best behaviour but it's as best as we can get with fucky episode indexes
    input: "/mnt/z/completed/Top Gear UK 1-17/Top Gear - Season 16/Top Gear - [16x00] The_Three_Wise_Men_Christmas.avi",
    title: "Top Gear",
    resolution: undefined,
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".avi",
    fileType: apollo.FileType.MEDIA,
    startYear: undefined,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: 16,
    episodeNumber: [0],
  },
  {
    // the " + Extras" meant this title was being ignored.
    input:
      "Y:\\media\\BoJack Horseman (2014) Season 1 S01 + Extras (1080p BluRay x265 HEVC 10bit AAC 5.1 RCVR)\\BoJack Horseman (2014) - S01E02 - BoJack Hates The Troops (1080p BluRay x265 RCVR).mkv",
    title: "BoJack Horseman",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: 2014,
    endYear: undefined,
    languages: [],
    audio: ["AAC"],
    seasonNumber: 1,
    episodeNumber: [2],
  },
  {
    // this makes sure the fix for the above test didn't break things.
    input:
      "Y:\\torrents\\BoJack Horseman (2014) Season 1 S01 + Extras (1080p BluRay x265 HEVC 10bit AAC 5.1 RCVR)\\Featurettes\\Side-by-side Animation Walk-Through.mkv",
  },
  {
    // the `_` instead of dots or actual spaces can be confusing
    // for whatever reason, the path at the start confuses title extraction.
    input: "/mnt/vtfs/torrents/completed/1080p/s01/Peaky_Blinders_S01E01_x265_1080p_BluRay_30nama_30NAMA.mkv",
    title: "Peaky Blinders",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: undefined,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: 1,
    episodeNumber: [1],
  },
  {
    // "Trailer" in "Trailer Park Boys" could be excluded thinking it's an actual trailer.
    input: `/mnt/vtfs/torrents/completed/Trailer Park Boys Season 9 [1080p] [HEVC]/S09E05 The Motel Can't Live at the Motel.mkv`,
    title: "Trailer Park Boys",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: undefined,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: 9,
    episodeNumber: [5],
  },
  {
    // same as above but testing with dots as paces because that previously broke things.
    input: `/mnt/vtfs/torrents/completed/Trailer.Park.Boys.Season.9.[1080p].[HEVC]/S09E05.The.Motel.Can't.Live.at.the.Motel.mkv`,
    title: "Trailer Park Boys",
    resolution: 1080,
    type: IMDBTitleType.SERIES,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: undefined,
    endYear: undefined,
    languages: [],
    audio: [],
    seasonNumber: 9,
    episodeNumber: [5],
  },
  {
    // this tests the opposite of above to make sure we're still counting "Trailer" directories
    input: `/mnt/vtfs/torrents/completed/Trailer/Not a Show Season 9 [1080p] [HEVC]/S09E05.mkv`,
  },
];

describe("parser tests", () => {
  for (const test of tests) {
    it.concurrent(`should parse "${test.input}"`, async () => {
      const parser = new ApolloParser();
      const output = await parser.parse(test.input);
      if (Object.keys(test).length === 1) {
        // we're testing to make sure it *isn't* parsed.
        expect(output).toBeUndefined();
      } else {
        delete (test as any).input;
        expect(output).toEqual(test);
      }
    });
  }
});
