import { parse } from "../helpers/parse";

it("should extract ids", () => {
  expect(parse("[id=t3_vavr7h]")).toMatchSnapshot();
  expect(parse("1525508539468419074_1")).toMatchSnapshot();
  expect(parse("1525508539468419074_1")).toMatchSnapshot();
  expect(parse("test-ph5d48409d154c4")).toMatchSnapshot();
  expect(parse("https://www.pornhub.com/view_video.php?viewkey=ph5d48409d154c4")).toMatchSnapshot();
});
