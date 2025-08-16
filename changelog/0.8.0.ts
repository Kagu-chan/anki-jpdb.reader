import { Category, ChangelogEntry } from './types';

export const _080: ChangelogEntry[] = [
  {
    type: 'add',
    description: 'Added the option to highlight i+1 sentences.',
    category: Category.Texthighlighter,
    issue: 54,
  },
  {
    type: 'remove',
    description: 'Removed the legacy text highlighter.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added the option to choose which card states are considered new.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
];
