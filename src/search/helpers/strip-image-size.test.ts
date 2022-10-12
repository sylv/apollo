import { expect, it } from "vitest";
import { stripImageSize } from "./strip-image-size";

it("should strip size info from urls", () => {
  expect(stripImageSize("https://m.media-amazon.com/images/M/MV5BNzQwNTA5NzA1MF5BMl5BanBnXkFtZTgwMjEwNzI0MjE@._V1_.jpg")).toMatchSnapshot();
  expect(
    stripImageSize("https://m.media-amazon.com/images/M/MV5BNzQwNTA5NzA1MF5BMl5BanBnXkFtZTgwMjEwNzI0MjE@._V1_UX224_CR0,0,224,126_AL_.jpg")
  ).toMatchSnapshot();
});
