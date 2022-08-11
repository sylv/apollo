import { replacePlaceholders } from "./replace-placeholders";

it("should replace placeholders", () => {
  expect(
    replacePlaceholders("My File ({year}) [imdbId={imdbId}]", {
      year: 2008,
      imdbId: "tt3230854",
    })
  ).toBe("My File (2008) [imdbId=tt3230854]");
});

it("should sanitize values for file names", () => {
  expect(replacePlaceholders("{name}", { name: "Test/File Name" })).toBe("Test File Name");
});

it("should remove empty brackets if the placeholder is missing", () => {
  const atPartEnd = "My File ({year})/test.mp4";
  expect(replacePlaceholders(atPartEnd, { year: 2017 })).toEqual("My File (2017)/test.mp4");
  expect(replacePlaceholders(atPartEnd, {})).toEqual("My File/test.mp4");
  const inPartMiddle = "My File ({year}) - {episode}.mp4";
  expect(replacePlaceholders(inPartMiddle, { episode: 1 })).toEqual("My File - 1.mp4");
  expect(replacePlaceholders(inPartMiddle, { year: 2008 })).toEqual("My File (2008).mp4");
});

it("should join arrays", () => {
  const atPartEnd = "My File [{audio}]";
  expect(replacePlaceholders(atPartEnd, { audio: ["AAC", "AC3"] })).toEqual("My File [AAC AC3]");
  expect(replacePlaceholders(atPartEnd, { audio: [1, 2, 3] })).toEqual("My File [1-2-3]");
});
