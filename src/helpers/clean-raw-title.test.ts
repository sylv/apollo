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

it('should remove " _ "', () => {
  // this is a bit of a gamble but some tools will replace things like : with _
  // sometimes they also do that for other things though like | so eh
  expect(cleanRawTitle("A Movie _ Test Title")).toBe("A Movie: Test Title");
});

it("should remove repetitive segments", () => {
  expect(cleanRawTitle("My Group/My Group Day One")).toBe("My Group Day One");
});
