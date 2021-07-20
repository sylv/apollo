import { PropertyAudio } from "./audio.property";
import { PropertyCollection } from "./collection.property";
import { PropertyEpisodes } from "./episodes.property";
import { PropertyLanguages } from "./languages.property";
import { PropertyResolution } from "./resolution.property";
import { PropertySeasonEpisode } from "./season-episode.property";
import { PropertySeasons } from "./seasons.property";
import { PropertyYear } from "./year.property";
import { PropertyQuality } from "./quality.property";
import { PropertyCoding } from "./coding.property";
import { PropertyDate } from "./date.property";

export const properties = [
  new PropertyAudio(),
  new PropertyCollection(),
  new PropertyEpisodes(),
  new PropertyLanguages(),
  new PropertyResolution(),
  new PropertySeasonEpisode(),
  new PropertySeasons(),
  new PropertyYear(),
  new PropertyQuality(),
  new PropertyCoding(),
  new PropertyDate(),
];
