import { ApolloParser } from "../classes/apollo-parser";
import { PropertySeasons } from "./seasons.property";

let parser: ApolloParser;

beforeEach(() => (parser = new ApolloParser()));

test("Should handle season ranges", () => {
  const extractor = new PropertySeasons();
  expect(extractor.extract("Seasons 1-3", parser)).toEqual([1, 2, 3]);
  expect(extractor.extract("Seasons 1-4/S01E13", parser)).toEqual([1, 2, 3, 4]);
});

test("Should not parse standalone seasons", () => {
  const extractor = new PropertySeasons();
  expect(extractor.extract("Season 1", parser)).toBeUndefined();
  expect(extractor.extract("S01E13", parser)).toBe(undefined);
});
