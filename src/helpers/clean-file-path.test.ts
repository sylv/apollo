import { cleanFilePath } from "./clean-file-path";

const title = `Avengers Infinity War (2018) [WEBRip] [1080p] [YTS.AM].mp4`;
const directory = `Bobs Burgers`;

it("should clean file paths", () => {
  expect(cleanFilePath(`/mnt/data/tv shows/${title}`)).toBe(title);
  expect(cleanFilePath(`/mnt/data/tv shows/${directory}/${title}`)).toBe(`${directory}/${title}`);
});

it("should normalize path separators", () => {
  expect(cleanFilePath(`C:\\mnt\\data\\${directory}\\${title}`)).toBe(`${directory}/${title}`);
});
