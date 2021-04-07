import { ApolloParser } from "../classes/ApolloParser";
import { apollo } from "../types";

export abstract class Property<Key extends keyof apollo.Parsed> {
  readonly key?: Key;

  extract?(cleanPath: string, parser: ApolloParser): apollo.Parsed[Key] | undefined;
  write(cleanPath: string, data: Partial<apollo.Parsed>, parser: ApolloParser): Partial<apollo.Parsed> {
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
