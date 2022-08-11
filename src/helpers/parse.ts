import { ApolloParser } from "../classes/apollo-parser";

export const parse = (input: string, providers = ["local", "imdb"]) => {
  const parser = new ApolloParser({ providers });
  return parser.parse(input);
};
