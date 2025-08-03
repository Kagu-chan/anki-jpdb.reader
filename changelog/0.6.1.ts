import { Category, ChangelogEntry } from './types';

export const _061: ChangelogEntry[] = [
  {
    type: 'change',
    description: 'Disabled YouTube Music parsing.',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fixed the same error message being shown multiple times.',
    category: Category.Popup,
    issue: 216,
  },
  {
    type: 'fix',
    description: 'Improved the error message shown on text highlighter errors.',
    category: Category.Popup,
    issue: 216,
  },
  {
    type: 'fix',
    description: 'The copy error button now writes the actual exception to the clipboard.',
    category: Category.Popup,
    issue: 216,
  },
  {
    type: 'fix',
    description: 'Issues with JPDB reachability are now displayed properly.',
    category: Category.API,
    issue: 193,
  },
  {
    type: 'fix',
    description: 'Fixed custom meta being applied twice.',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'change',
    description: 'Added the ability to filter simple hosts.',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fixed Kanji tokens not being applied for fragmented words.',
    category: Category.Texthighlighter,
    issue: 215,
  },
  {
    type: 'add',
    description: 'Added Satori Reader support.',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added NHK News support.',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'change',
    description: 'Updated documentation for custom parsing.',
    category: [Category.Hosts, Category.Documentation],
    issue: 217,
  },
  {
    type: 'change',
    description: 'Added the ability to mark all words as frequent.',
    category: Category.Texthighlighter,
    issue: 237,
  },
];
