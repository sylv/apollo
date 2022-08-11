jest.mock("fs/promises");
jest.mock("fs");

import { existsSync, readFileSync } from "fs";
import { DirectoryJSON, vol } from "memfs";
import { join } from "path";
import { rollback } from "../src/helpers/snapshots";
import { ApolloMode, ApolloStrategy, renameFiles, RenameOptions } from "../src/rename";

// in testing "Downloads-2" will break as it can't be removed because it might be important info,
// so the cli should slice that from the path.
const MOCK_DIRECTORY = "/mnt/Downloads-2/";
const MOCK_FILES = [
  "Deadpool 2016 1080p BluRay x264 DTS-JYK/Subs/French.srt",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E01.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E02.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E03.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E04.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E05.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E06.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E07.1080p.BluRay.x264-SHORTBREHD.mkv",
  "www.Torrenting.org       The Mandalorian S01E01 INTERNAL 1080p WEB H264-DEFLATE/The.Mandalorian.S01E01.INTERNAL.1080p.WEB.H264-DEFLATE.mkv",
  {
    name: "www.Torrenting.org       The Mandalorian S01E01 INTERNAL 1080p WEB H264-DEFLATE/The.Mandalorian.S01E01.INTERNAL.1080p.WEB.H264-DEFLATE.srt",
    content: readFileSync(join(__dirname, "./fixtures/lalaland.srt"), "utf8"),
  },
].map((file) => {
  if (typeof file === "string") {
    return {
      path: `${MOCK_DIRECTORY}${file}`,
      content: "",
    };
  } else {
    return {
      path: `${MOCK_DIRECTORY}${file.name}`,
      content: file.content,
    };
  }
});

beforeEach(() => {
  const config: DirectoryJSON = {};
  for (const file of MOCK_FILES) config[file.path] = file.content;
  vol.fromJSON(config);
});

afterEach(() => {
  vol.reset();
});

export const baseRenameOptions: RenameOptions = {
  inputDirectory: "/mnt/Downloads-2",
  outputDirectory: "/mnt/media",
  providers: ["local"],
  strategy: ApolloStrategy.FileNames,
  mode: ApolloMode.Move,
  minSize: 0,
  detectSubtitleLanguage: true,
  useSnapshots: false,
};

it("should move files as expected", async () => {
  await renameFiles({
    ...baseRenameOptions,
    deleteEmptyDirs: true,
  });

  expect(Object.keys(vol.toJSON())).toMatchSnapshot();
});

it("should not do anything with --dry-run enabled", async () => {
  await renameFiles({
    ...baseRenameOptions,
    dryRun: true,
  });

  expect(Object.keys(vol.toJSON())).toMatchSnapshot();
  expect(existsSync(`/mnt/media`)).toBe(false);
});

it("should allow reverting from snapshots", async () => {
  await renameFiles({
    ...baseRenameOptions,
    useSnapshots: true,
    deleteEmptyDirs: true,
  });

  expect(Object.keys(vol.toJSON())).toMatchSnapshot();
  await rollback(baseRenameOptions.inputDirectory);
  expect(Object.keys(vol.toJSON())).toMatchSnapshot();
});
