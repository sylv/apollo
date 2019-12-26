import { stripStringForComparison } from './stripStringForComparison';

describe('helpers/stripStringForComparison', () => {
  it('should strip strings for comparison', () => {
    // no shit right ^
    expect(stripStringForComparison('I.Am.Mother.2019.1080p.WEBRip.x264-[YTS.LT].mp4')).toEqual('i am mother 2019 webrip x264');
  });
});
