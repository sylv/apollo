import { expect, it } from "vitest";
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

it("should not strip boring parts after interesting parts", () => {
  expect(cleanFilePath("/mnt/data/tv shows/Test file name (2016)/French.srt")).toBe("Test file name (2016)/French.srt");
  expect(
    cleanFilePath("/mnt/Downloads-2/import/Менталист/The.Mentalist.s07.WEB-DL.720p.Rus.Eng/The.Mentalist.s07e12-13.WEB-DL.720p.Rus.Eng.mkv")
  ).toMatchSnapshot();
});

it("should maintain file extensions", () => {
  expect(cleanFilePath("/mnt/data/tv shows/Test file name.srt")).toBe("Test file name.srt");
  expect(cleanFilePath("/mnt/data/tv shows/Test.file.name.srt")).toBe("Test file name.srt");

  // maintaining extensions sometimes thought the extension was ".264-[TestGroup]" for this incorrectly,
  // so now we maintain known extensions only.
  expect(cleanFilePath("Mythbusters.S2003.576p.PAL.AUS.AMZN.WEB-DL.DD+2.0.H.264-[TestGroup]")).toBe(
    "Mythbusters S2003 576p PAL AUS AMZN WEB-DL DD+2 0 H 264-[TestGroup]"
  );
});
