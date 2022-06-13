import { PropertyAudio } from "./audio.property";
import { PropertyCoding } from "./coding.property";
import { PropertyCollection } from "./collection.property";
import { PropertyDate } from "./date.property";
import { PropertyEpisodes } from "./episodes.property";
import { PropertyIds } from "./ids.property";
import { PropertyIndex } from "./index.property";
import { PropertyLanguages } from "./languages.property";
import { PropertyQuality } from "./quality.property";
import { PropertyResolution } from "./resolution.property";
import { PropertySeasonEpisode } from "./season-episode.property";
import { PropertySeasons } from "./seasons.property";
import { PropertyYear } from "./year.property";

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
  new PropertyIndex(),
  new PropertyIds(),
];
