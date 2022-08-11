import { parse } from "../src/helpers/parse";

it("should parse standard file names", async () => {
  expect(parse("Test file name (22).JPG")).resolves.toEqual(
    expect.objectContaining({
      name: "Test File Name",
      index: 22,
      extension: ".jpg",
    })
  );
});
