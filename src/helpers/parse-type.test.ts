import { TitleType } from "../types";
import { parseType } from "./parse-type";

it("should parse movie types", () => {
  expect(parseType("tvmovie")).toBe(TitleType.MOVIE);
  expect(parseType("TVMOVIE")).toBe(TitleType.MOVIE);
  expect(parseType("tvMovie")).toBe(TitleType.MOVIE);
  expect(parseType("movie")).toBe(TitleType.MOVIE);
  expect(parseType("movie")).toBe(TitleType.MOVIE);
  expect(parseType("feature")).toBe(TitleType.MOVIE);
});

it("should parse series types", () => {
  expect(parseType("tvseries")).toBe(TitleType.SERIES);
  expect(parseType("tvminiseries")).toBe(TitleType.SERIES);
  expect(parseType("tv mini series")).toBe(TitleType.SERIES);
  expect(parseType("tv mini-series")).toBe(TitleType.SERIES);
  expect(parseType("tvSeries")).toBe(TitleType.SERIES);
});

it("should parse episode types", () => {
  expect(parseType("tvepisode")).toBe(TitleType.EPISODE);
  expect(parseType("episode")).toBe(TitleType.EPISODE);
});
