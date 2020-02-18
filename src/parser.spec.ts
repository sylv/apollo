import { apollo } from "./types";
import { ApolloParser } from "./parser";

const tests: (apollo.Parsed & { input: string })[] = [
  {
    title: "The Simpsons",
    resolution: 1080,
    type: apollo.TitleType.TV,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 7,
    episodeNumber: 25,
    input:
      "The Simpsons (1989-2018) Seasons 01-29 & Movie [1080p] [Ultimate Batch] [HEVC] [x265] [pseudo]/Season 07/The Simpsons - S07E25 - Summer of 4 Ft 2 [1080p] [x265] [pseudo].mkv"
  },
  {
    title: "Bob's Burgers",
    type: apollo.TitleType.TV,
    collection: true,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    startYear: 2011,
    languages: [],
    audio: [],
    seasonNumber: 1,
    episodeNumber: 2,
    input: "Bob's Burgers 2011 SE 1 - 8 Complete Eng Only Burntodisc/SE1/02 Human Flesh.mp4"
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    resolution: 1080,
    type: apollo.TitleType.MOVIE,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: 2001,
    languages: [],
    audio: [],
    input:
      "The Hobbit & The Lord of The Rings Extended Trilogy 1080p 10bit BluRay x265 HEVC MRN/The Lord of The Rings Trilogy Extended Cut 1080p 10bit BluRay x265 HEVC 6CH -MRN/1-Fellowship.of.The.Ring.2001.Extended.Cut.1080p.10bit.BluRay.x265.HEVC.6CH-MRN.mkv"
  },
  {
    title: "The Expanse",
    resolution: 1080,
    type: apollo.TitleType.TV,
    collection: true,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 3,
    episodeNumber: 11,
    input:
      "Z:\\torrents\\completed\\The EXPANSE - Complete Season 3 S03 (2018) - 1080p AMZN Web-DL x264\\The EXPANSE - S03 E11 - Fallen World (1080p - AMZN Web-DL).mp4"
  },
  {
    title: "American Dad!",
    type: apollo.TitleType.TV,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 13,
    episodeNumber: 4,
    input: "/mnt/z/torrents/completed/American Dad S01 - S13/Season 13/American Dad! - 13x04 - N.S.A. (No Snoops Allowed).mkv"
  },
  {
    title: "American Dad!",
    type: apollo.TitleType.TV,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 10,
    episodeNumber: 4,
    input: "/mnt/z/torrents/completed/American Dad S01 - S13/Season 10/American Dad! - 10x04 - Crotchwalkers.mkv"
  },
  {
    title: "The Legend of Korra",
    resolution: 1080,
    type: apollo.TitleType.TV,
    collection: false,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 3,
    episodeNumber: 12,
    input: "Avatar (TLoK) - S03 E12 - Enter the Void (1080p - BluRay).mp4"
  },
  {
    title: "The Legend of Korra",
    resolution: 1080,
    type: apollo.TitleType.TV,
    collection: true,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 4,
    episodeNumber: 10,
    input:
      "AVATAR Series (2005-2014) - COMPLETE The Last Airbender, 2010 Movie, Legend of Korra - 1080p BluRay x264\\2. The Legend of Korra (2012-14)\\Book 4a - Balance (2014)\\Avatar (TLoK) - S04 E10 - Operation Beifong (1080p - BluRay).mp4"
  },
  {
    title: "Con Air",
    resolution: 720,
    type: apollo.TitleType.MOVIE,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: 1997,
    languages: [],
    audio: ["AC3", "AC3"],
    input: "/mnt/z/torrents/completed/ConAir.1997.720p.BluRay.x264.AC3-RiPRG/ConAir.1997.720p.BluRay.x264.AC3-RiPRG.mkv"
  },
  {
    title: "The Hunger Games: Mockingjay - Part 2",
    resolution: 1080,
    type: apollo.TitleType.MOVIE,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    startYear: 2015,
    languages: [],
    audio: ["5.1"],
    input:
      "Z:\\torrents\\completed\\The Hunger Games 4 Film Complete Collection 1080p BluRay 5.1Ch x265 HEVC SUJAIDR\\The Hunger Games Mockingjay Part 2 (2015) 1080p BluRay 5.1Ch x265 HEVC SUJAIDR.mkv"
  },
  {
    title: "2012",
    resolution: 1080,
    type: apollo.TitleType.MOVIE,
    collection: false,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    startYear: 2009,
    languages: [],
    audio: [],
    input: "Z:\\torrents\\completed\\2012 (2009) [1080p]\\2012.2009.BluRay.1080p.x264.YIFY.mp4"
  },
  {
    title: "Silicon Valley",
    resolution: 720,
    type: apollo.TitleType.TV,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 5,
    episodeNumber: 1,
    input:
      "Z:\\torrents\\completed\\[TorrentCouch.com].Silicon.Valley.S05.Complete.720p.BRRip.x264.ESubs.[1.6GB].[Season.5.Full]\\[TorrentCouch.com].Silicon.Valley.S05E01.720p.BRRip.x264.ESubs.mkv"
  },
  {
    title: "The Legend of Korra",
    resolution: 1080,
    type: apollo.TitleType.TV,
    collection: true,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    episodeNumber: 3,
    input:
      "Z:\\torrents\\completed\\AVATAR Series (2005-2014) - COMPLETE The Last Airbender, 2010 Movie, Legend of Korra - 1080p BluRay x264\\2. The Legend of Korra (2012-14)\\Book 2a - Republic City Hustle (2013)\\Avatar (TLoK) - Republic City Hustle, Part 3 of 3 (1080p).mp4"
  },
  {
    title: "Top Gear",
    type: apollo.TitleType.TV,
    collection: false,
    extension: ".avi",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: ["5.1"],
    seasonNumber: 7,
    episodeNumber: 6,
    input: "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 7/Top Gear - [07x06] - 2005.12.27 [GOTHiC].avi"
  },
  {
    title: "Logan",
    resolution: 1080,
    type: apollo.TitleType.MOVIE,
    collection: false,
    extension: ".mp4",
    fileType: apollo.FileType.MEDIA,
    startYear: 2017,
    languages: [],
    audio: [],
    input: "/mnt/z/torrents/completed/Logan (2017) [1080p] [YTS.AG]/Logan.2017.1080p.BluRay.x264-[YTS.AG].mp4"
  },
  {
    title: "Top Gear",
    type: apollo.TitleType.TV,
    collection: false,
    extension: ".avi",
    fileType: apollo.FileType.MEDIA,
    startYear: 2008,
    languages: [],
    audio: [],
    seasonNumber: 10,
    episodeNumber: 1,
    input:
      "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 10/(auto) Top Gear - 10.07.2008 - [10x01] - [Greatest road in EU].avi"
  },
  {
    title: "Love, Death & Robots",
    resolution: 1080,
    type: apollo.TitleType.TV,
    collection: false,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: ["ITA", "ENG", "ITA", "ENG"],
    audio: [],
    seasonNumber: 1,
    episodeNumber: 1,
    input:
      "/mnt/z/torrents/completed/Love.Death.and.Robots.S01.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus/Love.Death.and.Robots.1x01.Il.Vantaggio.di.Sonnie.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus.mkv"
  },
  {
    title: "Watchmen",
    resolution: 720,
    type: apollo.TitleType.TV,
    collection: true,
    extension: ".mkv",
    fileType: apollo.FileType.MEDIA,
    languages: [],
    audio: [],
    seasonNumber: 1,
    episodeNumber: 1,
    input:
      "/mnt/z/torrents/completed/Watchmen.S01.COMPLETE.720p.AMZN.WEBRip.x264-GalaxyTV[TGx]/Watchmen.S01E01.720p.AMZN.WEBRip.x264-GalaxyTV.mkv"
  },
  {
    title: "Top Gear",
    type: apollo.TitleType.TV,
    collection: false,
    extension: ".avi",
    fileType: apollo.FileType.MEDIA,
    startYear: 2008,
    languages: [],
    audio: [],
    seasonNumber: 11,
    episodeNumber: 1,
    input: "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 11/(auto) Top Gear - 2008 - [11x01] - 2008.06.22 [$1k cop car].avi"
  }
];

describe("parser tests", () => {
  for (const test of tests) {
    it(`should parse "${test.input}"`, async () => {
      const parser = new ApolloParser();
      const output = await parser.parse(test.input);
      delete test.input;
      expect(output).toEqual(output);
    });
  }
});
