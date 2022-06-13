import { ApolloParser } from "../classes/apollo-parser";
import { IdType, PropertyIds } from "./ids.property";

let parser: ApolloParser;

beforeEach(() => (parser = new ApolloParser()));

test("should extract ids", () => {
  const extractor = new PropertyIds();
  expect(extractor.extract("[id=t3_vavr7h]", parser)).toEqual([
    {
      type: IdType.Reddit,
      id: "t3_vavr7h",
    },
  ]);

  expect(extractor.extract("1525508539468419074", parser)).toEqual([
    {
      type: IdType.Twitter,
      id: "1525508539468419074",
    },
  ]);

  expect(extractor.extract("DISCORD/1525508539468419074", parser)).toEqual([
    {
      type: IdType.Discord,
      id: "1525508539468419074",
    },
  ]);
});
