import { distance as getDistance } from "fastest-levenshtein";

export const strip = (input: string) => {
  return input
    .replace(/[^a-z0-9]/gi, " ")
    .replace(/ +/g, " ")
    .trim()
    .toLowerCase();
};

export const getStrippedDistance = (a: string, b: string) => {
  return getDistance(strip(a), strip(b));
};
