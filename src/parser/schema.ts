import { Schema } from './types';

const languages = ['ITA', 'ENG', 'RUS', 'SPA', 'JPN', 'KOR', 'GER', 'FRA', 'HIN'];
// h264, x264 etc are handled by regex. these are just "common" variants
const hevcNames = ['mpeg-h', 'mpeg-2', 'hevc'];
const avcNames = ['avc', 'mpeg-4'];

// some more involved extraction is handled by the parser directly
export const schema: Schema = {
  audio: {
    regex: /(AAC|AC3)/gi,
    index: 1
  },
  resolution: {
    regex: /(?: |\[|\()([0-9]{3,4})p/gi,
    index: 1,
    number: true
  },
  year: {
    regex: /(?: |\[|\()([0-9]{4})(?: |\)|\])/,
    index: 1,
    number: true
  },
  codec: {
    regex: new RegExp(`(?:(?:h|x)\\.?(264|265)|${hevcNames.join('|')}|${avcNames.join('|')})`, 'gi'),
    replace: true,
    extract: match => {
      const codecName = match[0].toLowerCase();
      if (hevcNames.includes(codecName)) {
        return 'h265';
      }

      if (avcNames.includes(codecName)) {
        return 'h264';
      }

      return `h${match[1]}`;
    }
  },
  language: {
    regex: new RegExp(`(${languages.join('|')})(?:(?:\.| )(${languages.join('|')}))+`, 'i'),
    extract: match =>
      match[0]
        .split(/(?:\.| )/g)
        .map(part => part.toUpperCase())
        .reduce((unique, part) => (unique.includes(part) ? unique : unique.concat(part)), [] as string[])
  },
  seasonNumber: {
    regex: /(?: |\[|\(|^)(?:(?:season|se|s)\.? ?([0-9]{1,2})|([0-9]{1,2})x[0-9]{1,2})/gi,
    index: [1, 2],
    // episode needs the season number to exist in some circumstances
    replace: false,
    number: true
  },
  episodeNumber: {
    regex: /(?:(?: |[0-9])(?:episode|ep|e)\.? ?([0-9]{1,2})|[0-9]{1,2}x([0-9]{1,2}))/gi,
    index: [1, 2],
    number: true,
    // Part [0-9] may be unreliable, so we just.. yeah.
    replace: false
  }
};
