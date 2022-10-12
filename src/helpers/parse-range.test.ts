import { expect, it } from "vitest";
import { parseRange } from "./parse-range";

it("should extract ranges", () => {
  expect(parseRange("E1E2", false)).toEqual([1, 2]);
  expect(parseRange("1-2-3", false)).toEqual([1, 2, 3]);
});

it("should expand ranges", () => {
  expect(parseRange("1-3", true)).toEqual([1, 2, 3]);
});

it("should return undefined for non-consecutive matches unless expanding", () => {
  expect(parseRange("1-3", false)).toBeUndefined();
});

it("should filter inconsistent matches", () => {
  expect(parseRange("E1-E2-EP3", false)).toEqual([1, 2]);
  expect(parseRange("1-2-3 - 100", false)).toEqual([1, 2, 3]);
  expect(parseRange("1-3 - 100", true)).toEqual([1, 2, 3]);
});
