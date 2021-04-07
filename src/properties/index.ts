import { PropertyAudio } from "./PropertyAudio";
import { PropertyCollection } from "./PropertyCollection";
import { PropertyEpisodes } from "./PropertyEpisodes";
import { PropertyLanguages } from "./PropertyLanguages";
import { PropertyResolution } from "./PropertyResolution";
import { PropertySeasonEpisode } from "./PropertySeasonEpisode";
import { PropertySeasons } from "./PropertySeasons";
import { PropertyYear } from "./PropertyYear";
import { PropertyQuality } from "./PropertyQuality";
import { PropertyCoding } from "./PropertyCoding";
import { PropertyDate } from "./PropertyDate";

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
