import { Feature } from './types';

export const CRUNCHYROLL: Feature = {
  id: 'crunchyroll.com',
  name: 'Crunchyroll',
  description: 'Force removes Crunchyroll subtitles',
  host: '*://static.crunchyroll.com/*',
  allFrames: true,
};

export const FEATURES: Feature[] = [CRUNCHYROLL];
