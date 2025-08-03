import { Category, ChangelogEntry } from './types';

export const _064: ChangelogEntry[] = [
  {
    type: 'add',
    description: 'Added an im- and export of settings',
    category: Category.Settings,
    issue: 66,
  },
  {
    type: 'add',
    description: 'Added a link to the GitHub issues page',
    category: Category.Settings,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added a debug mode for host configuration',
    category: Category.Settings,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fixed a bug where the parser would not parse nested elements',
    category: Category.Parser,
    issue: 238,
  },
];
