import mock from 'mock-fs'
import FileSystem from 'mock-fs/lib/filesystem';
import fs from 'fs'
import { Apollo } from '../src/index'

const MOCK_FILES = [
  "/mnt/downloads/The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E01.1080p.BluRay.x264-SHORTBREHD.mkv",
  "/mnt/downloads/The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E02.1080p.BluRay.x264-SHORTBREHD.mkv",
  "/mnt/downloads/The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E03.1080p.BluRay.x264-SHORTBREHD.mkv",
  "/mnt/downloads/The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E04.1080p.BluRay.x264-SHORTBREHD.mkv",
  "/mnt/downloads/The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E05.1080p.BluRay.x264-SHORTBREHD.mkv",
  "/mnt/downloads/The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E06.1080p.BluRay.x264-SHORTBREHD.mkv",
  "/mnt/downloads/The.Crown.S01.1080p.BluRay.x264-SHORTBREHD[rartv]/The.Crown.S01E07.1080p.BluRay.x264-SHORTBREHD.mkv"
];

beforeEach(() => {
  const config: FileSystem.DirectoryItems = {}
  for (const file of MOCK_FILES) config[file] = ''
  mock(config)
});

afterEach(() => {
  mock.restore()
})

test("Should move files as expected", async () => {
  const apollo = new Apollo({
    input: "/mnt/downloads",
    output: "/mnt/media",
    move: true,
    minSize: 0,
    dryRun: false,
    disableLookup: false
  });

  await apollo.run();
  expect(fs.existsSync('/mnt/media/TV Shows/The Crown/Season 1/The Crown S01E01.mkv')).toBe(true)
  expect(fs.existsSync('/mnt/media/TV Shows/The Crown/Season 1/The Crown S01E07.mkv')).toBe(true)
  expect(fs.existsSync('/mnt/media/TV Shows/The Crown/Season 1/The Crown S01E08.mkv')).toBe(false)
});
