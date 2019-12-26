import { cleanFileName } from './cleanFileName';

describe('helpers/cleanFileName', () => {
  it('should clean file names', () => {
    expect(cleanFileName('X-Men Dark Phoenix.2019.MULTi.UHD.BluRay.2160p.TrueHD.Atmos.7.1.HEVC-DDR')).toEqual({
      extension: undefined,
      cleanedFileName: 'X-Men Dark Phoenix 2019 2160p HEVC'
    });
  });
});
