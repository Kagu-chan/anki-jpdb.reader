import { Category, ChangelogEntry } from './types';

export const _060: ChangelogEntry[] = [
  {
    type: 'fix',
    description: 'Fix the parse page button shown despite the option being disabled',
    category: Category.Parser,
    issue: 190,
  },
  {
    category: Category.Documentation,
    type: 'add',
    description: 'Added the release date to the changelog',
    issue: 199,
  },
];
