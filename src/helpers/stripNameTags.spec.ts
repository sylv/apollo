import { stripNameTags } from './stripNameTags';

describe('helpers/stripNameTags', () => {
  it('should strip regular tags', () => {
    expect(stripNameTags('[pseudo] Rick and Morty')).toBe('Rick and Morty');
    expect(stripNameTags('My Movie (2019) EpicRelease-[BluRay]')).toBe('My Movie EpicRelease');
    expect(stripNameTags('I.Am.Mother.2019.1080p.WEBRip.x264-[YTS.LT].mp4')).toBe('I.Am.Mother.2019.1080p.WEBRip.x264 .mp4');
  });

  it('should strip tags with spaces', () => {
    expect(stripNameTags('Rick and Morty (1080p x265 10bit).mkv')).toBe('Rick and Morty .mkv');
  });
});
