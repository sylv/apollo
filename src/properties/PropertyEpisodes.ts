import { Property } from "./Property";
import { ApolloParser } from "../classes/ApolloParser";

const EPISODE_PATTERN = `(?<=episodes|episode|ep) ?(?<episodeStart>[0-9]{1,2})(?:(?: | ?- ?)(?<episodeEnd>[0-9]{1,2}))+(?= |\\/|$)`;
const EPISODES_REGEX = new RegExp(EPISODE_PATTERN, "gi");

export class PropertyEpisodes extends Property<"episodes"> {
  readonly key = "episodes";

  extract(cleanPath: string, parser: ApolloParser) {
    const rangeMatch = parser.getMatch(cleanPath, EPISODES_REGEX, false);
    if (!rangeMatch) return;
    const episodeStart = +rangeMatch.groups!.episodeStart;
    const episodeEnd = +rangeMatch.groups!.episodeEnd;
    if (isNaN(episodeStart) || isNaN(episodeEnd)) return;
    const index: number[] = [];
    for (let i = episodeStart; i <= episodeEnd; i++) {
      index.push(i);
    }

    return index;
  }
}
