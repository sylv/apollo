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

it('should replace " _ "', () => {
  // some tools replace | and : and some other characters with " _ " for some unknown mystical reason
  // if its further along in the title we use `|` because thats fairly common, otherwise we use : because
  // closer to the start thats more common. or something. it just feels right
  expect(cleanRawTitle("A Movie _ Test Title")).toBe("A Movie: Test Title");
  expect(cleanRawTitle("Really Long Titles Should Use Pipes Instead _ Because That Makes More Sense")).toBe(
    "Really Long Titles Should Use Pipes Instead | Because That Makes More Sense"
  );
  expect(cleanRawTitle("A Movie _ The Adventures Of A Really Long Title That Is Difficult To Come Up With _ The Prequel")).toBe(
    "A Movie: The Adventures Of A Really Long Title That Is Difficult To Come Up With | The Prequel"
  );
});

it("should remove repetitive segments", () => {
  expect(cleanRawTitle("My Group/My Group Day One")).toBe("My Group Day One");
});
