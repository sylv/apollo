import { ApolloParser } from "../classes/apollo-parser";
import { ApolloOutput } from "../types";
import { Property } from "./property";

export enum IdType {
  UNKNOWN = "UNKNOWN",
  Reddit = "REDDIT",
  PornHub = "PORNHUB",
  Twitter = "TWITTER",
  IMDB = "IMDB",
}

export interface IdPattern {
  type: IdType;
  pattern: RegExp;
  toUrl?: (id: string, type: IdType) => string;
  refine?: (cleanPath: string, match: RegExpExecArray) => Partial<NonNullable<ApolloOutput["ids"]>[0]> | undefined;
}

const ID_PATTERNS: IdPattern[] = [
  {
    // t3_vavr7h
    type: IdType.Reddit,
    pattern: /(?<=\b|_)t3_[0-9a-zA-Z]+(?=\b|_)/g,
    toUrl: (id: string) => `https://www.reddit.com/comments/${id}`,
  },
  {
    // ph5d48409d154c4
    type: IdType.PornHub,
    pattern: /(?<=\b|_)ph[0-9a-zA-Z]{12,14}(?=\b|_)/g,
    toUrl: (id: string) => `https://www.pornhub.com/view_video.php?viewkey=${id}`,
  },
  {
    // tt3230854
    type: IdType.IMDB,
    pattern: /(?<=\b|_)tt[0-9]{7,10}(?=\b|_)/g,
    toUrl: (id: string) => `https://www.imdb.com/title/${id}`,
  },
  {
    // 1525508539468419074
    type: IdType.Twitter,
    pattern: /(?<=\b|_)[0-9]{14,20}(?=\b|_)/g,
    toUrl: (id: string) => `https://twitter.com/i/status/${id}`,
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
    for (const { type, pattern, toUrl, refine } of ID_PATTERNS) {
      const matches = parser.getMatch(cleanPath, pattern, true);
      for (const match of matches) {
        const id = match.groups?.id ?? match[0];
        const refined = refine && refine(cleanPath, match);
        const url = toUrl && toUrl(id, type);
        ids.push({ type, id, url, ...refined });
      }
    }

    if (ids[0]) return ids;
  }
}
