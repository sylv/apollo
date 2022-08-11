import { readFile } from "fs/promises";
import ISO6391 from "iso-639-1";
import LanguageDetect from "languagedetect";
import { Cue, parseSync } from "subtitle";
import { log } from "../log";

export const detectSubtitleLanguage = async (subtitlePath: string) => {
  const content = await readFile(subtitlePath, "utf8");
  if (!content.trim()) {
    console.warn(`Skipping language detection for "${subtitlePath}" because it's empty`);
    return null;
  }

  log.debug(`Detecting language of "${subtitlePath}"`);
  const nodes = parseSync(content);
  const sample = nodes
    .filter((item) => item.type === "cue")
    .map((cue) => (cue.data as Cue).text)
    .slice(0, 100)
    .join("\n");

  const detector = new LanguageDetect();
  const result = detector.detect(sample, 4);
  const best = result[0];
  const second = result[1];
  const diff = best[1] - second[1];
  if (best[1] < 0.2 || diff < 0.075) {
    console.warn(`Could not detect language for "${subtitlePath}"`);
    return null;
  }

  const [languageName, probability] = result[0];
  const languageCode = ISO6391.getCode(languageName);
  return {
    languageName,
    languageCode,
    probability,
  };
};
