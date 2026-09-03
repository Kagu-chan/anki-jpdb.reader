import { Category, ChangelogEntry } from './types';

export const _081: ChangelogEntry[] = [
  {
    type: 'fix',
    description: 'Added the missing "Category: Unmined" color setting.',
    category: Category.Settings,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fixed multi-line custom color styles generating broken CSS.',
    category: Category.Settings,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fixed the color picker sometimes failing to reopen after closing it.',
    category: Category.Settings,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description:
      '"Plain known words" now hides and removes coloring for every state treated as known.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added a base word color setting.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added a furigana visibility setting for unclassified words.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fixed pitch accent CSS being generated while pitch accent markers are disabled.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fixed "Always" show furigana not overriding a page that hides furigana itself.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: "Fixed the color picker's toggle switches looking permanently dim/disabled.",
    category: Category.Settings,
    issue: 'N/A',
  },
];
