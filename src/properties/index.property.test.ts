import { ApolloParser } from "../classes/apollo-parser";
import { PropertyIndex } from "./index.property";

let parser: ApolloParser;

beforeEach(() => (parser = new ApolloParser()));

it("should parse indexes", () => {
  const extractor = new PropertyIndex();
  expect(extractor.extract("My Title (22)", parser)).toEqual(22);

  // this makes no sense
  expect(extractor.extract("My Title (0)", parser)).toBeUndefined();
  // years which are probably incorrectly identified
  expect(extractor.extract("My Title (2014)", parser)).toBeUndefined();
  expect(extractor.extract("My Title (1982)", parser)).toBeUndefined();

  // with path before
  expect(extractor.extract("/home/data/064 - the title.mp4", parser)).toBe(64);
  expect(extractor.extract("/home/data/32_the title.mp4", parser)).toBe(32);

  // with extension after
  expect(extractor.extract("123089123098123098_1.mp4", parser)).toBe(1);
  expect(extractor.extract("123089123098123098 - 1.mp4", parser)).toBe(1);
  expect(extractor.extract("123089123098123098 - 1", parser)).toBe(1);
  expect(extractor.extract("123089123098123098 - 32", parser)).toBe(32);
});
