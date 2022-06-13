import { ApolloParser } from "../classes/apollo-parser";
import { PropertyIndex } from "./index.property";

let parser: ApolloParser;

beforeEach(() => (parser = new ApolloParser()));

test("should parse indexes", () => {
  const extractor = new PropertyIndex();
  expect(extractor.extract("My Title (22)", parser)).toEqual(22);

  // this makes no sense
  expect(extractor.extract("My Title (0)", parser)).toBeUndefined();
  // years which are probably incorrectly identified
  expect(extractor.extract("My Title (2014)", parser)).toBeUndefined();
  expect(extractor.extract("My Title (1982)", parser)).toBeUndefined();
});
