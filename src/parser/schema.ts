import { avcNames, hevcNames, languages } from '../constants';
import { Schema } from './types';

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
    regex: /(?:se\. ?([0-9]{1,2})|season ([0-9]{1,2})|s([0-9]{1,2})(?:e|$| )|([0-9]{1,2})x[0-9]{1,2})/gi,
    // episode needs the season number to exist in some circumstances
    replace: false,
    extract: match => {
      for (let part of match.slice(1)) {
        const parsed = +part;
        if (isNaN(parsed) === false) {
          return parsed;
        }
      }
    }
  },
  // https://i.imgur.com/hj0nNxs.png
  // Test Name  1x1
  // Test Name ep10
  // Test Name s1e10
  // Test Name Season 10 Episode 9
  // Test Name episode 9
  episodeNumber: {
    regex: /(?: ep ?([0-9]{1,2})|episode ([0-9]{1,2})|(?: |[0-9])e([0-9]{1,2})|[0-9]{1,2}x([0-9]{1,2}))/gi,
    // Part [0-9] may be unreliable, so we just.. yeah.
    replace: false,
    extract: match => {
      for (let part of match.slice(1)) {
        const parsed = +part;
        if (isNaN(parsed) === false) {
          return parsed;
        }
      }
    }
  }
};
