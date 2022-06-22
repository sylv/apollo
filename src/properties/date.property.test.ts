import { ApolloParser } from "../classes/apollo-parser";
import { PropertyDate } from "./date.property";

let parser: ApolloParser;

beforeEach(() => (parser = new ApolloParser()));

it("should parse formats like 20070631", () => {
  const extractor = new PropertyDate();
  expect(extractor.extract("20071231", parser)).toEqual(new Date(2007, 11, 31));

  expect(extractor.extract("20071232", parser)).toBeUndefined(); // invalid day
  expect(extractor.extract("20071331", parser)).toBeUndefined(); // invalid month
  expect(extractor.extract("19991231", parser)).toBeUndefined(); // invalid year for this format
  expect(extractor.extract("2712390781", parser)).toBeUndefined(); // just a random number
});

it("should parse formats like 2007/07/31", () => {
  const extractor = new PropertyDate();
  expect(extractor.extract("2007/07/31", parser)).toEqual(new Date(2007, 6, 31));
});
