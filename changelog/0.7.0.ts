import { Category, ChangelogEntry } from './types';

export const _070: ChangelogEntry[] = [
  {
    type: 'fix',
    description: 'Fixed a race condition where custom styles were not applied correctly.',
    category: Category.Texthighlighter,
    issue: 330,
  },
  {
    type: 'fix',
    description: 'Fixed a race condition where sometimes a reload would not parse the page.',
    category: Category.Parser,
    issue: 306,
  },
  {
    type: 'add',
    description: 'Added support for Crunchyroll subtitles removal.',
    category: Category.Features,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added an option to extend the popup to the right of the word.',
    category: Category.Popup,
    issue: 315,
  },
];
