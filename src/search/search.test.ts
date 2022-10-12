import { expect, it } from "vitest";
import { TitleType } from "../types";
import { search } from "./search";

it('should prefer "top gear" over "top gear usa" for "top gear uk"', async () => {
  const result = await search({ name: "top gear uk", type: TitleType.SERIES });
  expect(result?.imdbId).toBe("tt1628033");
});

it('should prefer "married at first sight australia" to "married at first site" for "married at first sight au"', async () => {
  const result = await search({ name: "married at first sight au", type: TitleType.SERIES });
  expect(result?.imdbId).toBe("tt4771108");
});
