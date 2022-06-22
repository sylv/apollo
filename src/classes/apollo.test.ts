import mock from "mock-fs";
import FileSystem from "mock-fs/lib/filesystem";
import fs from "fs";
import { Apollo } from "./apollo";

// in testing "Downloads-2" will break as it can't be removed because it might be important info,
// so the cli should slice that from the path.
const MOCK_DIRECTORY = "/mnt/Downloads-2/";
const MOCK_FILES = [
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E01.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E02.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E03.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E04.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E05.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E06.1080p.BluRay.x264-SHORTBREHD.mkv",
  "The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E07.1080p.BluRay.x264-SHORTBREHD.mkv",
  "www.Torrenting.org       The Mandalorian S01E01 INTERNAL 1080p WEB H264-DEFLATE/The.Mandalorian.S01E01.INTERNAL.1080p.WEB.H264-DEFLATE.mkv",
  "www.Torrenting.org       The Mandalorian S01E01 INTERNAL 1080p WEB H264-DEFLATE/The.Mandalorian.S01E01.INTERNAL.1080p.WEB.H264-DEFLATE.srt",
].map((file) => `${MOCK_DIRECTORY}${file}`);

beforeEach(() => {
  const config: FileSystem.DirectoryItems = {};
  for (const file of MOCK_FILES) config[file] = "";
  mock(config);
});

afterEach(() => {
  mock.restore();
});

describe("Apollo CLI", () => {
  it("should move files as expected", async () => {
    const apollo = new Apollo({
      input: "/mnt/Downloads-2",
      output: "/mnt/media",
      move: true,
      minSize: 0,
      dryRun: false,
      disableLookup: false,
    });

    await apollo.run();
    expect(fs.existsSync("/mnt/media/TV Shows/The Crown/Season 1/The Crown S01E01.mkv")).toBe(true);
    expect(fs.existsSync("/mnt/media/TV Shows/The Crown/Season 1/The Crown S01E07.mkv")).toBe(true);
    expect(fs.existsSync("/mnt/media/TV Shows/The Crown/Season 1/The Crown S01E08.mkv")).toBe(false);
    expect(fs.existsSync("/mnt/media/TV Shows/The Mandalorian/Season 1/The Mandalorian S01E01.mkv")).toBe(true);
    expect(fs.existsSync("/mnt/media/TV Shows/The Mandalorian/Season 1/The Mandalorian S01E01.srt")).toBe(true);
  });
});
