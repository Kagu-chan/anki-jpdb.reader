import { Category, ChangelogEntry } from './types';

export const _065: ChangelogEntry[] = [
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
];
