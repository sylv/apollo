import { ApolloParser } from "../classes/apollo-parser";
import { IdType, PropertyIds } from "./ids.property";

let parser: ApolloParser;

beforeEach(() => (parser = new ApolloParser()));

it("should extract ids", () => {
  const extractor = new PropertyIds();
  expect(extractor.extract("[id=t3_vavr7h]", parser)).toMatchSnapshot();
  expect(extractor.extract("1525508539468419074_1", parser)).toMatchSnapshot();
  expect(extractor.extract("1525508539468419074_1", parser)).toMatchSnapshot();
  expect(extractor.extract("test-ph5d48409d154c4", parser)).toMatchSnapshot();
  expect(extractor.extract("https://www.pornhub.com/view_video.php?viewkey=ph5d48409d154c4", parser)).toMatchSnapshot();
});
