const VERSION_REGEX = /(?<=@\._V1_).*_(?=\.)/;
export const stripImageSize = (input: string) => {
  return input.replace(VERSION_REGEX, "");
};
