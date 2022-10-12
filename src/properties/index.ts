import { PropertyAudio } from "./audio.property";
import { PropertyCoding } from "./coding.property";
import { PropertyCollection } from "./collection.property";
import { PropertyContentRating } from "./content-rating.property";
import { PropertyDate } from "./date.property";
import { PropertyLinks } from "./links.property";
import { PropertyIndex } from "./index.property";
import { PropertyLanguages } from "./languages.property";
import { PropertyQuality } from "./quality.property";
import { PropertyReleaseGroup } from "./release-group.property";
import { PropertyResolution } from "./resolution.property";
import { PropertySeasonEpisode } from "./season-episode.property";
import { PropertyYear } from "./year.property";

export const properties = [
  new PropertyAudio(),
  new PropertyCollection(),
  new PropertyLanguages(),
  new PropertyResolution(),
  new PropertySeasonEpisode(),
  new PropertyYear(),
  new PropertyQuality(),
  new PropertyCoding(),
  new PropertyDate(),
  new PropertyIndex(),
  new PropertyLinks(),
  new PropertyContentRating(),
  new PropertyReleaseGroup(),
];
