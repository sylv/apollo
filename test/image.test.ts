import { parseTo } from "./util/parse-to";

it("should parse standard file names", async () => {
  await parseTo("Test file name (22).JPG", {
    title: "Test File Name",
    index: 22,
    extension: ".jpg",
  });
});
