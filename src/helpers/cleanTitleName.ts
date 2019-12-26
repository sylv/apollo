import { tagStart, tagEnd } from './stripNameTags';
import { titleCase } from './titleCase';

const cleanTitleNameRegex = /^( |-|,|\]|\[|\)|-)+|( |-|,|\]|\[|\(|-)+$/g;

/**
 * Remove tags at the start of a title. Some titles end with useful tags at the end, so we preserve those - ex "Avatar (tlok)"
 */
function removeStartTags(input: string) {
  let sliceTo = 0;
  let inTag = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char.trim() === '') continue;
    if (tagStart.includes(char)) {
      inTag = true;
      continue;
    }

    if (tagEnd.includes(char)) {
      inTag = false;
      sliceTo = i;
      continue;
    }

    if (inTag) {
      continue;
    }

    break;
  }

  if (sliceTo !== 0) {
    return input.substring(sliceTo + 1).trim();
  }

  return input.trim();
}

/**
 * Clean a title name. "avengers infinity war-" => "Avengers Infinity War"
 * @param input The dirty title. If the title already contains capitalisation we'll leave it alone.
 */
export function cleanTitleName(rawInput: string) {
  // if the title starts with a tag, chances are it's worthless garbage. But if it contains a random tag, it could be an abbreviation.
  // specifically this is the handle "Avatar (TLA)" while also stripping the useless tag from "[pseudo] My Show S01E01"
  const withoutStartTags = removeStartTags(rawInput);
  const withoutGarbage = withoutStartTags.replace(cleanTitleNameRegex, ' ');
  return titleCase(withoutGarbage);
}
