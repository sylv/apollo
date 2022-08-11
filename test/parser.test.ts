import { ApolloParser } from "../src/classes/apollo-parser";

const tests = [
  // "S2003" is a straight up weird format for season numbers.
  // todo: we should be able to interpret "DD+2.0" as an audio format.
  "Mythbusters.S2003.576p.PAL.AUS.AMZN.WEB-DL.DD+2.0.H.264-SmartIdiot",
  // testing for release groups
  "Mythbusters.S2003.576p.PAL.AUS.AMZN.WEB-DL.DD+2.0.H.264-TestGroup",
  "Mythbusters.S2003.576p.PAL.AUS.AMZN.WEB-DL.DD+2.0.H.264-[TestGroup]",
  "Mythbusters.S2003.576p.PAL.AUS.AMZN.WEB-DL.DD+2.0.H.264-[TestGroup].mp4",
  "Mythbusters.S2003.576p.PAL.AUS.AMZN.WEB-DL.DD+2.0.H.264 [TestGroup].mp4",
  // "m4v" isn't a common extension
  // there are no IMDb search results for this title, meaning we cant rely on it for more info
  // "BigBuckBunny" is hard to safely parse and will not have IMDb search results to help it
  // "640x360" isn't a common resolution format for torrents.
  "BigBuckBunny_640x360.m4v",
  // packs like this with a lot of mixed data in the parent directory often break things.
  "The Simpsons (1989-2018) Seasons 01-29 & Movie [1080p] [Ultimate Batch] [HEVC] [x265] [pseudo]/Season 07/The Simpsons - S07E25 - Summer of 4 Ft 2 [1080p] [x265] [pseudo].mkv",
  // "SE1/02" is a great torture test for index extraction.
  // "Complete Eng Only Burntodisc" is almost as long as the title and may confuse title extraction.
  "Bob's Burgers 2011 SE 1 - 8 Complete Eng Only Burntodisc/SE1/02 Human Flesh.mp4",
  // Multiple titles in the parent directory confuse title extraction and mean we have to rely on file names under specific circumstances like this
  // When extracting from just the file name due to the above issue, we only get a partial movie name (without "Lord of the Rings")
  "The Hobbit & The Lord of The Rings Extended Trilogy 1080p 10bit BluRay x265 HEVC MRN/The Lord of The Rings Trilogy Extended Cut 1080p 10bit BluRay x265 HEVC 6CH -MRN/1-Fellowship.of.The.Ring.2001.Extended.Cut.1080p.10bit.BluRay.x265.HEVC.6CH-MRN.mkv",
  // The space between "S03 E11" meant we weren't matching the season&episode properly.
  "Z:\\torrents\\completed\\The EXPANSE - Complete Season 3 S03 (2018) - 1080p AMZN Web-DL x264\\The EXPANSE - S03 E11 - Fallen World (1080p - AMZN Web-DL).mp4",
  // season ranges with spaces around the dash
  // "1x01" season&episode format
  "/mnt/z/torrents/completed/American Dad S01 - S13/Season 13/American Dad! - 13x04 - N.S.A. (No Snoops Allowed).mkv",
  // "10x04" season&episode format
  "/mnt/z/torrents/completed/American Dad S01 - S13/Season 10/American Dad! - 10x04 - Crotchwalkers.mkv",
  // "Avatar (TLoK)" isn't a title IMDb recognises, so we have to handle it ourselves.
  "Avatar (TLoK) - S03 E12 - Enter the Void (1080p - BluRay).mp4",
  // mixed names in parent directories
  // "avatar tlok" doesn't have search results on imdb
  // "2012-2014" year ranges have to be handled properly
  // "part 3 of 3" is not a valid season&episode format, so we handle it as best we can.
  "Z:\\torrents\\completed\\AVATAR Series (2005-2014) - COMPLETE The Last Airbender, 2010 Movie, Legend of Korra - 1080p BluRay x264\\2. The Legend of Korra (2012-14)\\Book 2a - Republic City Hustle (2013)\\Avatar (TLoK) - Republic City Hustle, Part 3 of 3 (1080p).mp4",
  // same as above, just another sanity check against insanity
  "AVATAR Series (2005-2014) - COMPLETE The Last Airbender, 2010 Movie, Legend of Korra - 1080p BluRay x264\\2. The Legend of Korra (2012-14)\\Book 4a - Balance (2014)\\Avatar (TLoK) - S04 E10 - Operation Beifong (1080p - BluRay).mp4",
  // https://youtu.be/rRKCMVuDT4g?t=130 this is reason enough to include this as a test
  "/mnt/z/torrents/completed/ConAir.1997.720p.BluRay.x264.AC3-RiPRG/ConAir.1997.720p.BluRay.x264.AC3-RiPRG.mkv",
  // "part 2", that single "2" character is the only difference between the hunger games part 1 & 2 and could be matched incorrectly as part 1.
  // this is just generally a great test with the "republic city hustle" test to make sure we don't accidentally start eating "part 2" thinking it's episode 2.
  "Z:\\torrents\\completed\\The Hunger Games 4 Film Complete Collection 1080p BluRay 5.1Ch x265 HEVC SUJAIDR\\The Hunger Games Mockingjay Part 2 (2015) 1080p BluRay 5.1Ch x265 HEVC SUJAIDR.mkv",
  // surprisingly this one hasn't caused any issues yet, though I figure it's a good test
  // due to the name "2012" potentially being mistaken for a year.
  "Z:\\torrents\\completed\\2012 (2009) [1080p]\\2012.2009.BluRay.1080p.x264.YIFY.mp4",
  // the prefix [TorrentCouch.com] gets in the way sometimes.
  "Z:\\torrents\\completed\\[TorrentCouch.com].Silicon.Valley.S05.Complete.720p.BRRip.x264.ESubs.[1.6GB].[Season.5.Full]\\[TorrentCouch.com].Silicon.Valley.S05E01.720p.BRRip.x264.ESubs.mkv",
  // brackets around season index
  "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 7/Top Gear - [07x06] - 2005.12.27 [GOTHiC].avi",
  // IMDB results would give a random movie with a long ass name name, which is why we now prefer exact matches when there are no spaces.
  "/mnt/z/torrents/completed/Logan (2017) [1080p] [YTS.AG]/Logan.2017.1080p.BluRay.x264-[YTS.AG].mp4",
  // (auto) prefix fucked things up
  "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 10/(auto) Top Gear - 10.07.2008 - [10x01] - [Greatest road in EU].avi",
  // previous season parsers would look up "Love Death and Robots S01" because
  // we were only matching the last occurence of an index, "1x01",
  // which is why ApolloParser#getMatches() works how it do
  "/mnt/z/torrents/completed/Love.Death.and.Robots.S01.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus/Love.Death.and.Robots.1x01.Il.Vantaggio.di.Sonnie.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus.mkv",
  // looking up this title would sometimes get it confused as the movie of the same name.
  "/mnt/z/torrents/completed/Watchmen.S01.COMPLETE.720p.AMZN.WEBRip.x264-GalaxySERIES[TGx]/Watchmen.S01E01.720p.AMZN.WEBRip.x264-GalaxySERIES.mkv",
  // had issues with the brackets in [11x01] and the full date "2008.06.22"
  "/mnt/z/torrents/completed/Top Gear UK 1-17/Top Gear - Season 11/(auto) Top Gear - 2008 - [11x01] - 2008.06.22 [$1k cop car].avi",
  // the dash in "S01e01-10" really fucked with the parser.
  "/mnt/z/Archer S01e01-10/Archer.1x05.Honeypot.1080p.BDMux.ITA.ENG.Subs.x264-Fratposa.mkv",
  // good test for confusing "Se7en" as "Season 7"
  "Se7en.1995.REMASTERED.1080p.BluRay.10bit.HEVC.6CH.MkvCage.ws.mkv",
  // good test for dots in place of spaces with no consistency whatsoever because whoever names torrents
  // takes a hit of acid then slams their face into their keyboard.
  "/home/ryan/clone/Family Guy - Complete H265/Season 17 [1080p x265][MP3 5.1]/Family.Guy.S17E16 [1080p Web x265][MP3 5.1].mp4",
  // www.Torrenting.org was being included as part of the title query on imdb and hiding otherwise valid results.
  "Z:\\clone\\www.Torrenting.org       The Mandalorian S01E01 INTERNAL 1080p WEB H264-DEFLATE\\The.Mandalorian.S01E01.INTERNAL.1080p.WEB.H264-DEFLATE.mkv",
  // good test for subtitle matching
  "Y:\\completed\\Deadpool 2016 1080p BluRay x264 DTS-JYK\\Subs\\French.srt",
  // multiple episodes in a single file
  "The Simpsons (1989-2018) Seasons 01-29 & Movie [1080p] [Ultimate Batch] [HEVC] [x265] [pseudo]/Season 28/The Simpsons - S28E12E13 - The Great Phatsby [1080p] [x265] [pseudo].mkv",
  // support for "0" episode numbers
  // todo: use this to test episode name extraction, ensuring to disable local episode name lookups
  "/mnt/z/completed/Top Gear UK 1-17/Top Gear - Season 16/Top Gear - [16x00] The_Three_Wise_Men_Christmas.avi",
  // the " + Extras" meant this title was being ignored due to poor blacklisting that was
  // only meant to be for directories. this is why we now check blacklists when breaking down the path in helpers/cleanFilePath.ts
  "Y:\\media\\BoJack Horseman (2014) Season 1 S01 + Extras (1080p BluRay x265 HEVC 10bit AAC 5.1 RCVR)\\BoJack Horseman (2014) - S01E02 - BoJack Hates The Troops (1080p BluRay x265 RCVR).mkv",
  // this shouldn't be matched because it's a featurette and isn't relevant.
  // it also makes sure the fix for the above test didn't break things.
  "Y:\\torrents\\BoJack Horseman (2014) Season 1 S01 + Extras (1080p BluRay x265 HEVC 10bit AAC 5.1 RCVR)\\Featurettes\\Side-by-side Animation Walk-Through.mkv",
  // the `_` instead of dots or actual spaces can be confusing
  // for whatever reason, the path at the start confuses title extraction.
  // good test that we're extracting "30NAMA" which is a valid release group
  "/mnt/vtfs/torrents/completed/Peaky_Blinders_S01E01_x265_1080p_BluRay_30nama_30NAMA.mkv",
  // "Trailer" in "Trailer Park Boys" could be excluded thinking it's an actual trailer.
  "/mnt/vtfs/torrents/completed/Trailer Park Boys Season 9 [1080p] [HEVC]/S09E05 The Motel Can't Live at the Motel.mkv",
  // same as above but testing with dots as spaces because that previously broke things.
  "/mnt/vtfs/torrents/completed/Trailer.Park.Boys.Season.9.[1080p].[HEVC]/S09E05.The.Motel.Can't.Live.at.the.Motel.mkv",
  // this tests the opposite of above to make sure we're still counting "Trailer" directories
  "/mnt/vtfs/torrents/completed/Trailer/Not a Show Season 9 [1080p] [HEVC]/S09E05.mkv",
  // good season pack test
  "The.Walking.Dead.S01-S07.Season.1-7.1080p.10bit.BluRay.5.1.x265.HEVC",
  // because "Rick and Morty" is the entire parent directory name, we wouldn't consider it
  // as a title because there were no other matches in the directory name.
  // this is actually a huge issue because we can't tell which is the title in "My Movies/Rick and Morty"
  // unless it were "My Movies/Rick and Morty S01E01". so this is kinda a fucky test which may or may not be removed
  // in the future if it turns out considering directories like this is bad.
  // todo: a better approach to these might be to search both and use whichever returns results, returning undefined if both do.
  "Rick and Morty/Season 5/Episode 3.mp4",
  // ensure we're extracting "interesting" parts of the path
  "/home/data/readonly/Group Trip/videos/Some Interesting Video-1.mp4",
  // ensure we're not extracting redundant parts of the path like "Group Trip/Group Trip - Some Interesting Video"
  "/home/data/readonly/Group Trip/videos/Group Trip - Some Interesting Video-1.mp4",
  // - no regex matches which would normally cause no title to be extracted
  // - "group com" was being stripped as it looked like a group.com link
  "/home/videos/Test Group/videos/Test Group compilation.mp4",
  // this has no valid season/episode and no year so its not valid as a movie or tv show
  // also checks for extracting TV-1
  "/test/[Beatrice-Raws] Fate Stay Night - Unlimited Blade Works TV-1 [BDRip 1920x1080 HEVC TrueHD]/NC/[Beatrice-Raws] Fate Stay Night - Unlimited Blade Works (Creditless ED_ep0) [BDRip 1920x1080 HEVC TrueHD].mkv",
  // some titles will use ep0 for specials, we need to make sure we support matching 0s for seasons and episodes
  // todo: this doesnt work
  "The Expanse S0E0.mp4",
];

describe("ApolloParser", () => {
  for (const input of tests) {
    it(`should parse "${input}"`, async () => {
      const parser = new ApolloParser({ providers: ["local", "imdb"] });
      const output = await parser.parse(input);
      expect(output).toMatchSnapshot();
    });
  }
});
