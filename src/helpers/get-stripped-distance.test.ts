import { expect, it } from "vitest";
import { strip } from "./get-stripped-distance";

it("should strip out non-english characters", () => {
  expect(strip("Test/Title - Some Other Portion")).toBe("test title some other portion");
  expect(strip("Test  Title_Some Other Portion")).toBe("test title some other portion");
});
