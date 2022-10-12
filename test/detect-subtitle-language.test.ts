import { join } from "path";
import { detectSubtitleLanguage } from "../src/helpers/detect-subtitle-language";
import { it, expect } from "vitest";

it("should detect subtitles languages", async () => {
  const result = await detectSubtitleLanguage(join(__dirname, "./fixtures/lalaland.srt"));
  expect(result?.languageCode).toBe("en");
});
