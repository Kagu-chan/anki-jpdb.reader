import { Category, ChangelogEntry } from './types';

export const _030: ChangelogEntry[] = [
  {
    type: 'fix',
    description: 'Furigana will no longer be copied when looking up a word.',
    category: [Category.Texthighlighter, Category.API],
    issue: 56,
  },
  {
    type: 'add',
    description: 'Added the ability to add words to FORQ.',
    category: Category.API,
    issue: 64,
  },
  {
    type: 'add',
    description: 'Added the ability to set sentences on JPDB.',
    category: Category.API,
    issue: 65,
  },
  {
    type: 'add',
    description: 'Added support for pitch accent.',
    category: Category.Texthighlighter,
    issue: 55,
  },
];
