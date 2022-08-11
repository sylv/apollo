const IMDB_ID_REGEX = /^tt\d{6,12}$/;
export const parseImdbId = (input: string) => {
  if (!IMDB_ID_REGEX.exec(input)) return;
  const int = Number(input.substring(2));
  return { imdbId: input, titleId: int };
};
