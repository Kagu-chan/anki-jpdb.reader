import { Category, ChangelogEntry } from './types';

export const _030: ChangelogEntry[] = [
  {
    type: 'fix',
    description: 'Furigana will no longer be copied when looking up a word',
    category: [Category.Texthighlighter, Category.API],
    issue: 56,
  },
  {
    type: 'add',
    description: 'Words can now be added to FORQ',
    category: Category.API,
    issue: 64,
  },
  {
    type: 'add',
    description: 'Sentences can now be set on JPDB',
    category: Category.API,
    issue: 65,
  },
  {
    type: 'add',
    description: 'Added support for Pitch Accent',
    category: Category.Texthighlighter,
    issue: 55,
  },
];
