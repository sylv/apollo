import { ApolloParser } from "../classes/apollo-parser";
import { ApolloOutput } from "../types";

export abstract class Property<Key extends keyof ApolloOutput> {
  readonly key?: Key;

  extract?(cleanPath: string, parser: ApolloParser): ApolloOutput[Key] | undefined;
  write(cleanPath: string, data: Partial<ApolloOutput>, parser: ApolloParser): Partial<ApolloOutput> {
    if (!this.key) throw new Error(`Missing "key" on ${this.constructor.name}`);
    if (!this.extract) throw new Error(`Missing "extract" on ${this.constructor.name} with default "write"`);
    const output = this.extract(cleanPath, parser);
    if (output !== undefined) {
      // previously this assigned it regardless but if we set undefined values to undefined,
      // Object.assign will overwrite set values with undefined. This is bad when we handle collections,
      // so not defining it if its undefined might allow more data in.
      (data as any)[this.key] = output;
    }

    return data;
  }
}
