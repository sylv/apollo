import { ApolloParser } from "../../src";
import { PropertyEpisodes } from "../../src/properties/PropertyEpisodes";

let parser: ApolloParser;

beforeEach(() => (parser = new ApolloParser()));

test("Should handle episode ranges", () => {
  const extractor = new PropertyEpisodes();
  expect(extractor.extract("Episodes 1-3", parser)).toEqual([1, 2, 3]);
  expect(extractor.extract("Episodes 1-4/S01E13", parser)).toEqual([1, 2, 3, 4]);
  expect(extractor.extract("EP1-4/S01E13", parser)).toEqual([1, 2, 3, 4]);
});

test("Should not parse standalone episodes", () => {
  const extractor = new PropertyEpisodes();
  expect(extractor.extract("Episode 1", parser)).toBeUndefined();
  expect(extractor.extract("S01E13", parser)).toBe(undefined);
});
