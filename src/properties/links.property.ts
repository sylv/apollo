import { ApolloParser } from "../classes/apollo-parser";
import { ApolloOutput } from "../types";
import { Property } from "./property";

export interface IdPattern {
  name: string;
  pattern: RegExp;
  toUrl?: (id: string) => string;
}

const ID_PATTERNS: IdPattern[] = [
  {
    // tt3230854
    name: "IMDb",
    pattern: /(?<=\b|_)tt[0-9]{7,10}(?=\b|_)/g,
    toUrl: (id) => `https://www.imdb.com/title/${id}`,
  },
  {
    // t3_vavr7h
    name: "Reddit",
    pattern: /(?<=\b|_)t3_[0-9a-zA-Z]+(?=\b|_)/g,
    toUrl: (id) => `https://www.reddit.com/comments/${id}`,
  },
  {
    // ph5d48409d154c4
    name: "PornHub",
    pattern: /(?<=\b|_)ph[0-9a-zA-Z]{12,14}(?=\b|_)/g,
    toUrl: (id) => `https://www.pornhub.com/view_video.php?viewkey=${id}`,
  },
  {
    // 1525508539468419074
    name: "Twitter",
    pattern: /(?<=\b|_)[0-9]{14,20}(?=\b|_)/g,
    toUrl: (id) => `https://twitter.com/i/status/${id}`,
  },
  {
    // [id=xxx]
    // (id=xxx)
    // [postId=xxx]
    name: "Unknown",
    pattern: /\b(?:id|postId|post_id)=?(?<id>[0-9a-zA-Z]{3,10})\b/g,
  },
];

export class PropertyLinks extends Property<"links"> {
  readonly key = "links";

  extract(cleanPath: string, parser: ApolloParser, extracted: ApolloOutput) {
    const links: ApolloOutput["links"] = [];
    for (const { name, pattern, toUrl } of ID_PATTERNS) {
      const matches = parser.getMatch(cleanPath, pattern, true);
      for (const match of matches) {
        const id = match.groups?.id ?? match[0];
        const url = toUrl && toUrl(id);
        links.push({
          name,
          id,
          url,
        });

        if (name === "IMDb") {
          extracted.imdbId = id;
        }
      }
    }

    if (links[0]) return links;
  }
}
