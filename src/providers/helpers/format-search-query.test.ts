import { formatSearchQuery } from "./format-search-query";

it('should alias "avatar tlok" to "the_legend_of_korra"', () => {
  expect(formatSearchQuery("avatar tlok")).toEqual("the legend of korra");
  expect(formatSearchQuery("avatar tlok", "_")).toEqual("the_legend_of_korra");
});

it("should format queries", () => {
  expect(formatSearchQuery("a test - query")).toEqual("a test query");
  expect(formatSearchQuery("a test - query", "_")).toEqual("a_test_query");
});

it("should remove double spaces", () => {
  expect(formatSearchQuery("a test -  query   ")).toEqual("a test query");
});
