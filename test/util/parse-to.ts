import { ApolloParser } from "../../src/classes/apollo-parser";
import { ApolloOutput } from "../../src/types";

export const parseTo = async (input: string, expectResult: Partial<ApolloOutput>, parser = new ApolloParser()) => {
  const result = await parser.parse(input);
  expect(result).toEqual(expect.objectContaining(expectResult));
};
