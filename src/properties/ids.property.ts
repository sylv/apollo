import { ApolloParser } from "../classes/apollo-parser";
import { ApolloOutput } from "../types";
import { Property } from "./property";

export enum IdType {
  UNKNOWN = "UNKNOWN",
  Reddit = "REDDIT",
  PornHub = "PORNHUB",
  Twitter = "TWITTER",
  Discord = "DISCORD",
  IMDBTitle = "IMDB_TITLE",
}

export interface IdPattern {
  type: IdType;
  pattern: RegExp;
  refine?: (cleanPath: string, match: RegExpExecArray) => Partial<NonNullable<ApolloOutput["ids"]>[0]> | undefined;
}

const ID_PATTERNS: IdPattern[] = [
  {
    // t3_vavr7h
    type: IdType.Reddit,
    pattern: /\bt3_[0-9a-zA-Z]+\b/g,
  },
  {
    // ph5d48409d154c4
    type: IdType.PornHub,
    pattern: /\bph[0-9a-zA-Z]{10,16}\b/g,
  },
  {
    // tt3230854
    type: IdType.IMDBTitle,
    pattern: /\btt[0-9]{7,10}\b/g,
  },
  {
    // 532902669220839426 (discord snowflake)
    // 1525508539468419074 (twitter snowflake)
    type: IdType.UNKNOWN,
    pattern: /\b[0-9]{14,20}\b/g,
    refine: (cleanPath: string) => {
      if (cleanPath.toLowerCase().includes("discord")) return { type: IdType.Discord };
      return { type: IdType.Twitter };
    },
  },
  {
    // [id=xxx]
    // (id=xxx)
    // [postId=xxx]
    type: IdType.UNKNOWN,
    pattern: /\b(?:id|postId|post_id)=?(?<id>[0-9a-zA-Z]{3,10})\b/g,
  },
];

export class PropertyIds extends Property<"ids"> {
  readonly key = "ids";

  extract(cleanPath: string, parser: ApolloParser) {
    const ids: ApolloOutput["ids"] = [];
    for (const { type, pattern, refine } of ID_PATTERNS) {
      const matches = parser.getMatch(cleanPath, pattern, true);
      for (const match of matches) {
        const id = match.groups?.id ?? match[0];
        const refined = refine && refine(cleanPath, match);
        ids.push({ type, id, ...refined });
      }
    }

    if (ids[0]) return ids;
  }
}
