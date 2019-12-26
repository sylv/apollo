import { NameParser } from './';
import { FileType, ParsedName } from './types';

const titles: (ParsedName & { raw: string })[] = [
  {
    raw: 'Mission impossible 1 AC3 5.1 ITA.ENG 1080p H265 sub ita.eng (1996) Sp33dy94-MIRCrew.mkv',
    title: 'Mission Impossible 1',
    type: FileType.MOVIE,
    extension: '.mkv',
    audio: 'AC3',
    resolution: 1080,
    year: 1996,
    codec: 'h265',
    language: ['ITA', 'ENG'],
    seasonNumber: undefined,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    raw: 'Mission impossible 4 Ghost Protocol AC3 5.1 ITA.ENG 1080p H265 sub ita.eng (2011) Sp33dy94-MIRCrew.mkv',
    title: 'Mission Impossible 4 Ghost Protocol',
    type: FileType.MOVIE,
    extension: '.mkv',
    audio: 'AC3',
    resolution: 1080,
    year: 2011,
    codec: 'h265',
    language: ['ITA', 'ENG'],
    seasonNumber: undefined,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    raw: 'Avengers Endgame 2019.4K.HDR.2160p.BDRip Ita Eng x265-NAHOM',
    title: 'Avengers Endgame',
    type: FileType.MOVIE,
    extension: undefined,
    audio: undefined,
    resolution: 2160,
    year: 2019,
    codec: 'h265',
    language: ['ITA', 'ENG'],
    seasonNumber: undefined,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    raw: 'bojack.horseman.s05e01.720p.web.x264-strife.mkv',
    title: 'Bojack Horseman',
    type: FileType.EPISODE,
    extension: '.mkv',
    audio: undefined,
    resolution: 720,
    year: undefined,
    codec: 'h264',
    language: undefined,
    seasonNumber: 5,
    episodeNumber: 1,
    episodeName: undefined
  },
  {
    raw: '[pseudo] Rick and Morty S01E02 - Lawnmower Dog [1080p] [h.265].mkv',
    title: 'Rick and Morty',
    type: FileType.EPISODE,
    extension: '.mkv',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: 'h265',
    language: undefined,
    seasonNumber: 1,
    episodeNumber: 2,
    episodeName: 'Lawnmower Dog'
  },
  {
    raw: "TRON Uprising - Ep. 01 - Beck's Beginning (1080p - Web-DL).mp4",
    title: 'TRON Uprising',
    type: FileType.EPISODE,
    extension: '.mp4',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: undefined,
    episodeNumber: 1,
    episodeName: "Beck's Beginning"
  },
  {
    raw: 'Westworld.S01E02.1080p.BluRay.x265.HEVC.6CH-MRN.mkv',
    title: 'Westworld',
    type: FileType.EPISODE,
    extension: '.mkv',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: 'h265',
    language: undefined,
    seasonNumber: 1,
    episodeNumber: 2,
    episodeName: undefined
  },
  {
    raw: 'Love.Death.and.Robots.1x03.La.Testimone.ITA.ENG.1080p.NF.WEB-DLMux.DD5.1.x264-Morpheus.mkv',
    title: 'Love Death and Robots',
    type: FileType.EPISODE,
    extension: '.mkv',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: 'h264',
    language: ['ITA', 'ENG'],
    seasonNumber: 1,
    episodeNumber: 3,
    episodeName: 'La Testimone'
  },
  {
    raw: 'The Wire Season 1 Episode 04 - Old Cases.avi',
    title: 'The Wire',
    type: FileType.EPISODE,
    extension: '.avi',
    audio: undefined,
    resolution: undefined,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: 1,
    episodeNumber: 4,
    episodeName: 'Old Cases'
  },
  {
    raw: 'Barry S01E04.mp4',
    title: 'Barry',
    type: FileType.EPISODE,
    extension: '.mp4',
    audio: undefined,
    resolution: undefined,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: 1,
    episodeNumber: 4,
    episodeName: undefined
  },
  {
    raw: 'IO.2019.ITA.ENG.1080p.NF.WEBRip.DD5.1.x264-Morpheus.mkv',
    title: 'IO',
    type: FileType.MOVIE,
    extension: '.mkv',
    audio: undefined,
    resolution: 1080,
    year: 2019,
    codec: 'h264',
    language: ['ITA', 'ENG'],
    seasonNumber: undefined,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    raw: '2012.2009.BluRay.1080p.x264.YIFY.mp4',
    title: '2012',
    type: FileType.MOVIE,
    extension: '.mp4',
    audio: undefined,
    resolution: 1080,
    year: 2009,
    codec: 'h264',
    language: undefined,
    seasonNumber: undefined,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    raw: 'Game.Of.Thrones.5.1Ch.S03.Season.3.1080p.BluRay.ReEnc-DeeJayAhmed',
    title: 'Game of Thrones',
    type: FileType.EPISODE,
    extension: undefined,
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: 3,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    raw: 'big_buck_bunny_1080p_h264.mov',
    title: 'Big Buck Bunny',
    type: FileType.MOVIE,
    extension: '.mov',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: 'h264',
    language: undefined,
    seasonNumber: undefined,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    raw: 'Avatar (TLoK) - S04 E13 - The Last Stand (1080p - BluRay).mp4',
    title: 'Avatar (TLoK)',
    type: FileType.EPISODE,
    extension: '.mp4',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: 4,
    episodeNumber: 13,
    episodeName: 'The Last Stand'
  },
  {
    raw: '[pseudo] Avatar (TLA) - S01 E01 - The Boy in the Iceberg (1080p - BluRay).mp4',
    title: 'Avatar (TLA)',
    type: FileType.EPISODE,
    extension: '.mp4',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: 1,
    episodeNumber: 1,
    episodeName: 'The Boy in the Iceberg'
  },
  {
    raw: 'X-Men Dark Phoenix.2019.MULTi.UHD.BluRay.2160p.TrueHD.Atmos.7.1.HEVC-DDR.mkv',
    title: 'X-Men Dark Phoenix',
    type: FileType.MOVIE,
    extension: '.mkv',
    audio: undefined,
    resolution: 2160,
    year: 2019,
    codec: 'h265',
    language: undefined,
    seasonNumber: undefined,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    // todo: full path was "D:\Media\Family Guy - Complete H265\Season 16 [1080p x265][AAC 5[1080p Web x265][MP3 5.1]"
    // we should be able to handle this by going up until we hit something useful
    raw: 'S16E01 Emmy-Winning Episode[1080p Web x265][MP3 5.1].mp4',
    title: undefined,
    type: FileType.EPISODE,
    extension: '.mp4',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: 'h265',
    language: undefined,
    seasonNumber: 16,
    episodeNumber: 1,
    episodeName: 'Emmy-Winning Episode'
  },
  {
    raw: 'Avatar (TLoK) - Republic City Hustle, Part 3 of 3 (1080p).mp4',
    title: 'Avatar (TLoK)',
    type: FileType.EPISODE,
    extension: '.mp4',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: undefined,
    episodeNumber: 3,
    episodeName: 'Republic City Hustle'
  },
  {
    raw: 'Family.Guy.S17E01 [1080p Web x265][MP3 5.1].mp4',
    title: 'Family Guy',
    type: FileType.EPISODE,
    extension: '.mp4',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: 'h265',
    language: undefined,
    seasonNumber: 17,
    episodeNumber: 1,
    episodeName: undefined
  },
  {
    raw: 'Scrubs - [04x19] - My Best Laid Plans',
    title: 'Scrubs',
    type: FileType.EPISODE,
    extension: undefined,
    audio: undefined,
    resolution: undefined,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: 4,
    episodeNumber: 19,
    episodeName: 'My Best Laid Plans'
  },
  {
    raw: 'my.episode.s01e01',
    title: 'My Episode',
    type: FileType.EPISODE,
    extension: undefined,
    audio: undefined,
    resolution: undefined,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: 1,
    episodeNumber: 1,
    episodeName: undefined
  },
  {
    raw: 'my.episode.s01e01.episode.name',
    title: 'My Episode',
    type: FileType.EPISODE,
    extension: undefined,
    audio: undefined,
    resolution: undefined,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: 1,
    episodeNumber: 1,
    episodeName: 'Episode Name'
  },
  {
    raw: 'Brooklyn.Nine-Nine.S01E22.1080p.5.1Ch.Web-DL.ReEnc-DeeJayAhmed.mkv',
    title: 'Brooklyn Nine-Nine',
    type: FileType.EPISODE,
    extension: '.mkv',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: undefined,
    language: undefined,
    seasonNumber: 1,
    episodeNumber: 22,
    episodeName: undefined
  },
  {
    raw: 'The Hunger Games Mockingjay Part 1 (2014) 1080p BluRay 5.1Ch x265 HEVC SUJAIDR',
    title: 'The Hunger Games Mockingjay Part 1',
    type: FileType.MOVIE,
    extension: undefined,
    audio: undefined,
    resolution: 1080,
    year: 2014,
    codec: 'h265',
    language: undefined,
    seasonNumber: undefined,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    raw: 'Se7en.1995.REMASTERED.1080p.BluRay.10bit.HEVC.6CH.MkvCage.ws.mkv',
    title: 'Se7en',
    type: FileType.MOVIE,
    extension: '.mkv',
    audio: undefined,
    resolution: 1080,
    year: 1995,
    codec: 'h265',
    language: undefined,
    seasonNumber: undefined,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    raw: 'X-Men Dark Phoenix 2019 2160p HEVC',
    title: 'X-Men Dark Phoenix',
    type: FileType.MOVIE,
    extension: undefined,
    audio: undefined,
    resolution: 2160,
    year: 2019,
    codec: 'h265',
    language: undefined,
    seasonNumber: undefined,
    episodeNumber: undefined,
    episodeName: undefined
  },
  {
    raw: 'Mr. Robot S01E01 eps1.0_hellofriend.mov (1080p x265 10bit Joy).mkv',
    title: 'Mr Robot',
    type: FileType.EPISODE,
    extension: '.mkv',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: 'h265',
    language: undefined,
    seasonNumber: 1,
    episodeNumber: 1,
    episodeName: 'eps1.0_hellofriend.mov'
  },
  {
    raw:
      'C:\\media\\Family Guy - Complete H265\\Season 16 [1080p x265][AAC 5[1080p Web x265][MP3 5.1]\\S16E01 Emmy-Winning Episode[1080p Web x265][MP3 5.1].mp4',
    title: 'Family Guy',
    type: FileType.EPISODE,
    extension: '.mp4',
    audio: undefined,
    resolution: 1080,
    year: undefined,
    codec: 'h265',
    language: undefined,
    seasonNumber: 16,
    episodeNumber: 1,
    episodeName: 'Emmy-Winning Episode'
  },
  {
    raw: 'C:\\media\\Brooklyn Nine-Nine Season 2 1080p WEB-DL 10bit AAC5.1 HEVC x265 MEANDRAGON\\S00E23 Johnny And Dora.mkv',
    title: 'Brooklyn Nine-Nine',
    type: FileType.EPISODE,
    extension: '.mkv',
    audio: 'AAC',
    resolution: 1080,
    year: undefined,
    codec: 'h265',
    language: undefined,
    seasonNumber: 2,
    episodeNumber: 23,
    episodeName: 'Johnny and Dora'
  },
  {
    raw:
      'C:\\media\\Brooklyn.Nine-Nine.Season.3.Complete.720p.WEB.x264-[MULVAcoded]\\Brooklyn.Nine.Nine.S00E02.Webisode.Hitchcock.and.Scully.(1).WEB.x264-[MULVAcoded].mp4',
    title: 'Brooklyn Nine-Nine',
    type: FileType.EPISODE,
    extension: '.mp4',
    audio: undefined,
    resolution: 720,
    year: undefined,
    codec: 'h264',
    language: undefined,
    seasonNumber: 3,
    episodeNumber: 2,
    episodeName: 'Hitchcock and Scully'
  }
];

describe('parser tests', () => {
  for (let test of titles) {
    it(`should parse "${test.raw}"`, () => {
      const parser = new NameParser();
      const output = parser.parse(test.raw);
      delete test.raw;
      delete output.excess;

      // ava says defined properties that are undefined and properties that are undefined are the same thing
      // this hacks around that
      for (let [key, value] of Object.entries(test)) {
        if (value !== undefined) {
          continue;
        }

        const outputValue = (output as any)[key];
        const testValue = (test as any)[key];
        const outputIsUndefined = outputValue == undefined && testValue === outputValue;
        if (outputIsUndefined) {
          delete (test as any)[key];
          delete (output as any)[key];
        }
      }

      expect(output).toEqual(test);
    });
  }
});
