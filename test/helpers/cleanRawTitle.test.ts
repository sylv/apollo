import { cleanRawTitle } from "../../src/helpers/cleanRawTitle";

test("Should strip tags from titles", () => {
  expect(cleanRawTitle("(auto) Top Gear [1080p]")).toBe("Top Gear");
  expect(cleanRawTitle("(us) A Movie")).toBe("A Movie");
  expect(cleanRawTitle("A Movie (")).toBe("A Movie");
  expect(cleanRawTitle("1-A Movie")).toBe("A Movie");
});

test("Should strip release groups from titles", () => {
  expect(cleanRawTitle("Infinity War 1080p dolby atmos-QxR")).toBe("Infinity War 1080p Dolby Atmos");
  expect(cleanRawTitle("Infinity War 1080p dolby atmos [rarbg]")).toBe("Infinity War 1080p Dolby Atmos");
  expect(cleanRawTitle("Infinity War 1080p dolby atmos[rarbg]")).toBe("Infinity War 1080p Dolby Atmos");
});

test("Should capitalise lowercase titles", () => {
  expect(cleanRawTitle("fellowship of the ring")).toBe("Fellowship of the Ring");
});

test("Should not remove capitalisation of already-capitalised strings", () => {
  expect(cleanRawTitle("IO")).toBe("IO");
  expect(cleanRawTitle("Fellowship of The Ring")).toBe("Fellowship of The Ring");
});
