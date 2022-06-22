import { stripSpacePlaceholders } from "./strip-space-placeholders";

it("should leave strings alone that are likely not using other characters as spaces", () => {
  const input = "A Movie 1080p x265 Atmos 5.1";
  expect(stripSpacePlaceholders(input)).toBe(input);
});

it("should replace dots used as spaces", () => {
  const input = "A.Movie.1080p.x265.Atmos.5.1";
  const output = "A Movie 1080p x265 Atmos 5 1";
  expect(stripSpacePlaceholders(input)).toBe(output);
});

it("should replace underscores used as spaces", () => {
  const input = "A_Movie_1080p_x265_Atmos_5.1";
  const output = "A Movie 1080p x265 Atmos 5.1";
  expect(stripSpacePlaceholders(input)).toBe(output);
});
