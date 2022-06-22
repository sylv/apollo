import { cleanRawTitle } from "./clean-raw-title";

it("should strip tags from titles", () => {
  expect(cleanRawTitle("(auto) Top Gear [1080p]")).toBe("Top Gear");
  expect(cleanRawTitle("(us) A Movie")).toBe("A Movie");
  expect(cleanRawTitle("A Movie (")).toBe("A Movie");
  expect(cleanRawTitle("1-A Movie")).toBe("A Movie");
});

it("should strip release groups from titles", () => {
  expect(cleanRawTitle("Infinity War 1080p dolby atmos-QxR")).toBe("Infinity War 1080p Dolby Atmos");
  expect(cleanRawTitle("Infinity War 1080p dolby atmos [rarbg]")).toBe("Infinity War 1080p Dolby Atmos");
  expect(cleanRawTitle("Infinity War 1080p dolby atmos[rarbg]")).toBe("Infinity War 1080p Dolby Atmos");
});

it("should capitalise lowercase titles", () => {
  expect(cleanRawTitle("fellowship of the ring")).toBe("Fellowship of the Ring");
});

it("should not remove capitalisation of already-capitalised strings", () => {
  expect(cleanRawTitle("IO")).toBe("IO");
  expect(cleanRawTitle("Fellowship of The Ring")).toBe("Fellowship of The Ring");
});
