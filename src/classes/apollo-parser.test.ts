/* cSpell:disable */
import { TitleType } from "@ryanke/imdb-api";
import { Quality } from "../data/qualities.data";
import { ApolloOutput, FileType } from "../types";
import { ApolloParser } from "./apollo-parser";

interface ApolloTest {
  id: string | undefined;
  input: string;
  output: Partial<ApolloOutput> | undefined;
}

const tests: Array<ApolloTest> = [
  {
    // "S2003" is a straight up weird format for season numbers.
    // todo: we should be able to interpret "DD+2.0" as an audio format.
    id: "tt0383126",
    input: "Mythbusters.S2003.576p.PAL.AUS.AMZN.WEB-DL.DD+2.0.H.264-SmartIdiot",
    output: {
      title: "MythBusters",
      seasonNumber: 2003,
      episodeNumber: undefined,
      languages: [],
      audio: [],
      collection: false,
      extension: undefined,
      fileType: FileType.Video,
      quality: Quality.WEB_DL,
      coding: ["H264"],
      titleType: TitleType.SERIES,
      resolution: {
        width: null,
        height: 576,
      },
    },
  },
  {
    // "m4v" isn't a common extension
    // there are no IMDb search results for this title, meaning we cant rely on it for more info
    // "BigBuckBunny" is hard to safely parse and will not have IMDb search results to help it
    // "640x360" isn't a common resolution format for torrents.
    id: undefined,
    input: "BigBuckBunny_640x360.m4v",
    output: {
      extension: ".m4v",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { width: 640, height: 360 },
      coding: [],
      title: "Big Buck Bunny",
    },
  },
  {
    // packs like this with a lot of mixed data in the parent directory often break things.
    id: "tt0096697",
    input:
      "The Simpsons (1989-2018) Seasons 01-29 & Movie [1080p] [Ultimate Batch] [HEVC] [x265] [pseudo]/Season 07/The Simpsons - S07E25 - Summer of 4 Ft 2 [1080p] [x265] [pseudo].mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 7,
      episodeNumber: [25],
      seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
      startYear: 1989,
      endYear: 2018,
      coding: ["x265"],
      titleType: TitleType.EPISODE,
      title: "The Simpsons",
    },
  },
  {
    // "SE1/02" is a great torture test for index extraction.
    // "Complete Eng Only Burntodisc" is almost as long as the title and may confuse title extraction.
    id: "tt1561755",
    input: "Bob's Burgers 2011 SE 1 - 8 Complete Eng Only Burntodisc/SE1/02 Human Flesh.mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: [],
      collection: true,
      languages: [],
      seasonNumber: 1,
      episodeNumber: [2],
      seasons: [1, 2, 3, 4, 5, 6, 7, 8],
      startYear: 2011,
      coding: [],
      titleType: TitleType.EPISODE,
      title: "Bob's Burgers",
    },
  },
  {
    // Multiple titles in the parent directory confuse title extraction and mean we have to rely on file names under specific circumstances like this
    // When extracting from just the file name due to the above issue, we only get a partial movie name (without "Lord of the Rings")
    id: "tt0120737",
    input:
      "The Hobbit & The Lord of The Rings Extended Trilogy 1080p 10bit BluRay x265 HEVC MRN/The Lord of The Rings Trilogy Extended Cut 1080p 10bit BluRay x265 HEVC 6CH -MRN/1-Fellowship.of.The.Ring.2001.Extended.Cut.1080p.10bit.BluRay.x265.HEVC.6CH-MRN.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      index: 1,
      audio: ["6ch"],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      startYear: 2001,
      quality: Quality.BLU_RAY,
      coding: ["10bit", "x265", "HEVC"],
      titleType: TitleType.MOVIE,
      title: "The Lord of the Rings: The Fellowship of the Ring",
    },
  },
  {
    // The space between "S03 E11" meant we weren't matching the season&episode properly.
    id: "tt3230854",
    input: "Z:\\torrents\\completed\\The EXPANSE - Complete Season 3 S03 (2018) - 1080p AMZN Web-DL x264\\The EXPANSE - S03 E11 - Fallen World (1080p - AMZN Web-DL).mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 3,
      episodeNumber: [11],
      startYear: 2018,
      quality: Quality.WEB_DL,
      coding: [],
      titleType: TitleType.EPISODE,
      title: "The Expanse",
    },
  },
  {
    // season ranges with spaces around the dash
    // "1x01" season&episode format
    id: "tt0397306",
    input: "/mnt/z/torrents/completed/American Dad S01 - S13/Season 13/American Dad! - 13x04 - N.S.A. (No Snoops Allowed).mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      seasonNumber: 13,
      episodeNumber: [4],
      coding: [],
      titleType: TitleType.EPISODE,
      title: "American Dad!",
    },
  },
  {
    // "10x04" season&episode format
    id: "tt0397306",
    input: "/mnt/z/torrents/completed/American Dad S01 - S13/Season 10/American Dad! - 10x04 - Crotchwalkers.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      seasonNumber: 10,
      episodeNumber: [4],
      coding: [],
      titleType: TitleType.EPISODE,
      title: "American Dad!",
    },
  },
  {
    // "Avatar (TLoK)" isn't a title IMDb recognises, so we have to handle it ourselves.
    id: "tt1695360",
    input: "Avatar (TLoK) - S03 E12 - Enter the Void (1080p - BluRay).mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 3,
      episodeNumber: [12],
      coding: [],
      titleType: TitleType.EPISODE,
      title: "The Legend of Korra",
    },
  },
  {
    // mixed names in parent directories
    // "avatar tlok" doesn't have search results on imdb
    // "2012-2014" year ranges have to be handled properly
    // "part 3 of 3" is not a valid season&episode format, so we handle it as best we can.
    id: "tt1695360",
    input:
      "Z:\\torrents\\completed\\AVATAR Series (2005-2014) - COMPLETE The Last Airbender, 2010 Movie, Legend of Korra - 1080p BluRay x264\\2. The Legend of Korra (2012-14)\\Book 2a - Republic City Hustle (2013)\\Avatar (TLoK) - Republic City Hustle, Part 3 of 3 (1080p).mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      episodeNumber: [3],
      startYear: 2013,
      quality: Quality.BLU_RAY,
      coding: [],
      titleType: TitleType.EPISODE,
      title: "The Legend of Korra",
    },
  },
  {
    // same as above
    id: "tt1695360",
    input:
      "AVATAR Series (2005-2014) - COMPLETE The Last Airbender, 2010 Movie, Legend of Korra - 1080p BluRay x264\\2. The Legend of Korra (2012-14)\\Book 4a - Balance (2014)\\Avatar (TLoK) - S04 E10 - Operation Beifong (1080p - BluRay).mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 4,
      episodeNumber: [10],
      startYear: 2014,
      quality: Quality.BLU_RAY,
      coding: [],
      titleType: TitleType.EPISODE,
      title: "The Legend of Korra",
    },
  },
  {
    // https://youtu.be/rRKCMVuDT4g?t=130 this is reason enough to include this as a test
    id: "tt0118880",
    input: "/mnt/z/torrents/completed/ConAir.1997.720p.BluRay.x264.AC3-RiPRG/ConAir.1997.720p.BluRay.x264.AC3-RiPRG.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: ["ac3", "ac3"],
      collection: false,
      languages: [],
      resolution: { height: 720, width: null },
      startYear: 1997,
      quality: Quality.BLU_RAY,
      coding: ["x264", "x264"],
      titleType: TitleType.MOVIE,
      title: "Con Air",
    },
  },
  {
    // "part 2", that single "2" character is the only difference between the hunger games part 1 & 2 and could be matched incorrectly as part 1.
    // this is just generally a great test with the "republic city hustle" test to make sure we don't accidentally start eating "part 2" thinking it's episode 2.
    id: "tt1951266",
    input:
      "Z:\\torrents\\completed\\The Hunger Games 4 Film Complete Collection 1080p BluRay 5.1Ch x265 HEVC SUJAIDR\\The Hunger Games Mockingjay Part 2 (2015) 1080p BluRay 5.1Ch x265 HEVC SUJAIDR.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      startYear: 2015,
      quality: Quality.BLU_RAY,
      coding: ["x265", "HEVC"],
      titleType: TitleType.MOVIE,
      title: "The Hunger Games: Mockingjay - Part 2",
    },
  },
  {
    // surprisingly this one hasn't caused any issues yet, though I figure it's a good test
    // due to the name "2012" potentially being mistaken for a year.
    id: "tt1190080",
    input: "Z:\\torrents\\completed\\2012 (2009) [1080p]\\2012.2009.BluRay.1080p.x264.YIFY.mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      startYear: 2009,
      quality: Quality.BLU_RAY,
      coding: ["x264"],
      titleType: TitleType.MOVIE,
      title: "2012",
    },
  },
  {
    // the prefix [TorrentCouch.com] gets in the way sometimes.
    id: "tt2575988",
    input:
      "Z:\\torrents\\completed\\[TorrentCouch.com].Silicon.Valley.S05.Complete.720p.BRRip.x264.ESubs.[1.6GB].[Season.5.Full]\\[TorrentCouch.com].Silicon.Valley.S05E01.720p.BRRip.x264.ESubs.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 720, width: null },
      seasonNumber: 5,
      episodeNumber: [1],
      quality: Quality.BLU_RAY,
      coding: ["x264"],
      titleType: TitleType.EPISODE,
      title: "Silicon Valley",
    },
  },
  {
    // brackets around season index
    id: "tt1628033",
    input: "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 7/Top Gear - [07x06] - 2005.12.27 [GOTHiC].avi",
    output: {
      extension: ".avi",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      seasonNumber: 7,
      episodeNumber: [6],
      seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      startYear: 2005,
      coding: [],
      date: new Date("2005.12.27"),
      titleType: TitleType.EPISODE,
      title: "Top Gear",
    },
  },
  {
    // IMDB results would give a random movie with a long ass name name, which is why we now prefer exact matches when there are no spaces.
    id: "tt3315342",
    input: "/mnt/z/torrents/completed/Logan (2017) [1080p] [YTS.AG]/Logan.2017.1080p.BluRay.x264-[YTS.AG].mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      startYear: 2017,
      quality: Quality.BLU_RAY,
      coding: ["x264"],
      titleType: TitleType.MOVIE,
      title: "Logan",
    },
  },
  {
    // (auto) prefix fucked things up
    id: "tt1628033",
    input: "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 10/(auto) Top Gear - 10.07.2008 - [10x01] - [Greatest road in EU].avi",
    output: {
      extension: ".avi",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      seasonNumber: 10,
      episodeNumber: [1],
      seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      coding: [],
      date: new Date("10.07.2008"),
      titleType: TitleType.EPISODE,
      title: "Top Gear",
    },
  },
  {
    // previous season parsers would look up "Love Death and Robots S01" because
    // we were only matching the last occurence of an index, "1x01",
    // which is why ApolloParser#getMatches() works how it do
    id: "tt9561862",
    input:
      "/mnt/z/torrents/completed/Love.Death.and.Robots.S01.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus/Love.Death.and.Robots.1x01.Il.Vantaggio.di.Sonnie.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: ["dd5.1", "dd5.1"],
      collection: false,
      languages: ["ITA", "ENG", "ITA", "ENG"],
      resolution: { height: 1080, width: null },
      seasonNumber: 1,
      episodeNumber: [1],
      coding: ["x264", "x264"],
      titleType: TitleType.EPISODE,
      title: "Love, Death & Robots",
    },
  },
  {
    // looking up this title would sometimes get it confused as the movie of the same name.
    id: "tt7049682",
    input: "/mnt/z/torrents/completed/Watchmen.S01.COMPLETE.720p.AMZN.WEBRip.x264-GalaxySERIES[TGx]/Watchmen.S01E01.720p.AMZN.WEBRip.x264-GalaxySERIES.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 720, width: null },
      seasonNumber: 1,
      episodeNumber: [1],
      quality: Quality.WEB_DL,
      coding: ["x264"],
      titleType: TitleType.EPISODE,
      title: "Watchmen",
    },
  },
  {
    // had issues with the brackets in [11x01] and the full date "2008.06.22"
    id: "tt1628033",
    input: "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 11/(auto) Top Gear - 2008 - [11x01] - 2008.06.22 [$1k cop car].avi",
    output: {
      extension: ".avi",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      seasonNumber: 11,
      episodeNumber: [1],
      seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      startYear: 2008,
      coding: [],
      date: new Date("2008.06.22"),
      titleType: TitleType.EPISODE,
      title: "Top Gear",
    },
  },
  {
    // the dash in "S01e01-10" really fucked with the parser.
    id: "tt1486217",
    input: "/mnt/z/Archer S01e01-10/Archer.1x05.Honeypot.1080p.BDMux.ITA.ENG.Subs.x264-Fratposa.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: ["ITA", "ENG"],
      resolution: { height: 1080, width: null },
      seasonNumber: 1,
      episodeNumber: [5],
      coding: ["x264"],
      titleType: TitleType.EPISODE,
      title: "Archer",
    },
  },
  {
    // good test for confusing "Se7en" as "Season 7"
    id: "tt0114369",
    input: "Se7en.1995.REMASTERED.1080p.BluRay.10bit.HEVC.6CH.MkvCage.ws.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: ["6ch"],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      startYear: 1995,
      quality: Quality.BLU_RAY,
      coding: ["10bit", "HEVC"],
      titleType: TitleType.MOVIE,
      title: "Se7en",
    },
  },
  {
    // good test for dots in place of spaces with no consistency whatsoever because whoever names torrents
    // takes a hit of acid then slams their face into their keyboard.
    id: "tt0182576",
    input: "/home/ryan/clone/Family Guy - Complete H265/Season 17 [1080p x265][MP3 5.1]/Family.Guy.S17E16 [1080p Web x265][MP3 5.1].mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: ["mp3", "5.1"],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 17,
      episodeNumber: [16],
      quality: Quality.WEB_DL,
      coding: ["x265"],
      titleType: TitleType.EPISODE,
      title: "Family Guy",
    },
  },
  {
    // www.Torrenting.org was being included as part of the title query on imdb and hiding otherwise valid results.
    id: "tt8111088",
    input: "Z:\\clone\\www.Torrenting.org       The Mandalorian S01E01 INTERNAL 1080p WEB H264-DEFLATE\\The.Mandalorian.S01E01.INTERNAL.1080p.WEB.H264-DEFLATE.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 1,
      episodeNumber: [1],
      quality: Quality.WEB_DL,
      coding: ["H264", "H264"],
      titleType: TitleType.EPISODE,
      title: "The Mandalorian",
    },
  },
  {
    id: "tt1431045",
    input: "Y:\\completed\\Deadpool 2016 1080p BluRay x264 DTS-JYK\\Subs\\French.srt",
    output: {
      extension: ".srt",
      fileType: FileType.Subtitle,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      startYear: 2016,
      quality: Quality.BLU_RAY,
      coding: ["x264"],
      titleType: TitleType.MOVIE,
      title: "Deadpool",
    },
  },
  {
    id: "tt0096697",
    input:
      "The Simpsons (1989-2018) Seasons 01-29 & Movie [1080p] [Ultimate Batch] [HEVC] [x265] [pseudo]/Season 28/The Simpsons - S28E12E13 - The Great Phatsby [1080p] [x265] [pseudo].mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 28,
      episodeNumber: [12, 13],
      seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
      startYear: 1989,
      endYear: 2018,
      coding: ["x265"],
      titleType: TitleType.EPISODE,
      title: "The Simpsons",
    },
  },
  {
    // support for "0" episode numbers
    id: "tt1628033",
    input: "/mnt/z/completed/Top Gear UK 1-17/Top Gear - Season 16/Top Gear - [16x00] The_Three_Wise_Men_Christmas.avi",
    output: {
      extension: ".avi",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      seasonNumber: 16,
      episodeNumber: [0],
      seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      coding: [],
      titleType: TitleType.EPISODE,
      title: "Top Gear",
    },
  },
  {
    // the " + Extras" meant this title was being ignored due to poor blacklisting that was
    // only meant to be for directories. this is why we now check blacklists when breaking down the path in helpers/cleanFilePath.ts
    id: "tt3398228",
    input:
      "Y:\\media\\BoJack Horseman (2014) Season 1 S01 + Extras (1080p BluRay x265 HEVC 10bit AAC 5.1 RCVR)\\BoJack Horseman (2014) - S01E02 - BoJack Hates The Troops (1080p BluRay x265 RCVR).mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: ["aac", "5.1"],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 1,
      episodeNumber: [2],
      startYear: 2014,
      quality: Quality.BLU_RAY,
      coding: ["x265", "HEVC", "10bit", "x265"],
      titleType: TitleType.EPISODE,
      title: "BoJack Horseman",
    },
  },
  {
    // this shouldn't be matched because it's a featurette and isn't relevant.
    // it also makes sure the fix for the above test didn't break things.
    id: undefined,
    input: "Y:\\torrents\\BoJack Horseman (2014) Season 1 S01 + Extras (1080p BluRay x265 HEVC 10bit AAC 5.1 RCVR)\\Featurettes\\Side-by-side Animation Walk-Through.mkv",
    output: undefined,
  },
  {
    // the `_` instead of dots or actual spaces can be confusing
    // for whatever reason, the path at the start confuses title extraction.
    id: "tt2442560",
    input: "/mnt/vtfs/torrents/completed/Peaky_Blinders_S01E01_x265_1080p_BluRay_30nama_30NAMA.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 1,
      episodeNumber: [1],
      quality: Quality.BLU_RAY,
      coding: ["x265"],
      titleType: TitleType.EPISODE,
      title: "Peaky Blinders",
    },
  },
  {
    // "Trailer" in "Trailer Park Boys" could be excluded thinking it's an actual trailer.
    id: "tt0290988",
    input: "/mnt/vtfs/torrents/completed/Trailer Park Boys Season 9 [1080p] [HEVC]/S09E05 The Motel Can't Live at the Motel.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 9,
      episodeNumber: [5],
      coding: ["HEVC"],
      titleType: TitleType.EPISODE,
      title: "Trailer Park Boys",
    },
  },
  {
    // same as above but testing with dots as spaces because that previously broke things.
    id: "tt0290988",
    input: "/mnt/vtfs/torrents/completed/Trailer.Park.Boys.Season.9.[1080p].[HEVC]/S09E05.The.Motel.Can't.Live.at.the.Motel.mkv",
    output: {
      extension: ".mkv",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      resolution: { height: 1080, width: null },
      seasonNumber: 9,
      episodeNumber: [5],
      coding: ["HEVC"],
      titleType: TitleType.EPISODE,
      title: "Trailer Park Boys",
    },
  },
  {
    // this tests the opposite of above to make sure we're still counting "Trailer" directories
    id: undefined,
    input: "/mnt/vtfs/torrents/completed/Trailer/Not a Show Season 9 [1080p] [HEVC]/S09E05.mkv",
    output: undefined,
  },
  {
    id: "tt1520211",
    input: "The.Walking.Dead.S01-S07.Season.1-7.1080p.10bit.BluRay.5.1.x265.HEVC",
    output: {
      extension: undefined,
      fileType: FileType.Video,
      audio: ["5.1"],
      collection: true,
      languages: [],
      resolution: { height: 1080, width: null },
      seasons: [1, 2, 3, 4, 5, 6, 7],
      quality: Quality.BLU_RAY,
      coding: ["10bit", "x265", "HEVC"],
      titleType: TitleType.SERIES,
      title: "The Walking Dead",
    },
  },
  {
    // because "Rick and Morty" is the entire parent directory name, we wouldn't consider it
    // as a title because there were no other matches in the directory name.
    // this is actually a huge issue because we can't tell which is the title in "My Movies/Rick and Morty"
    // unless it were "My Movies/Rick and Morty S01E01". so this is kinda a fucky test which may or may not be removed
    // in the future if it turns out considering directories like this is bad.
    id: "tt2861424",
    input: "Rick and Morty/Season 5/Episode 3.mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      seasonNumber: 5,
      episodeNumber: [3],
      coding: [],
      titleType: TitleType.EPISODE,
      title: "Rick and Morty",
    },
  },
  {
    // ensure we're extracting "interesting" parts of the path
    id: undefined,
    input: "/home/data/readonly/Group Trip/videos/Some Interesting Video-1.mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      coding: [],
      index: 1,
      title: "Group Trip/Some Interesting Video",
    },
  },
  {
    // ensure we're not extracting redundant parts of the path
    id: undefined,
    input: "/home/data/readonly/Group Trip/videos/Group Trip - Some Interesting Video-1.mp4",
    output: {
      extension: ".mp4",
      fileType: FileType.Video,
      audio: [],
      collection: false,
      languages: [],
      coding: [],
      index: 1,
      title: "Group Trip - Some Interesting Video",
    },
  },
];

describe("ApolloParser", () => {
  for (const test of tests) {
    it.concurrent(`should parse "${test.input}"`, async () => {
      const parser = new ApolloParser();
      const output = await parser.parse(test.input);
      const outputId = output?.imdb?.id;
      if (output) delete output.imdb;
      expect(output).toEqual(test.output);
      expect(outputId).toBe(test.id);
    });
  }
});
