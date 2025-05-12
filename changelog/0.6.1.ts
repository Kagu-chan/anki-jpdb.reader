import { Category, ChangelogEntry } from './types';

export const _061: ChangelogEntry[] = [
  {
    type: 'change',
    description: 'Disable youtube music parsing',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fix the same error message being shown multiple times',
    category: Category.Popup,
    issue: 216,
  },
  {
    type: 'fix',
    description: 'Improved the error shown on text highlighter errors',
    category: Category.Popup,
    issue: 216,
  },
  {
    type: 'fix',
    description: 'The copy error button now writes the actual exception to the clipboard',
    category: Category.Popup,
    issue: 216,
  },
  {
    type: 'fix',
    description: 'Issues with JPDB reachability will now get displayed properly',
    category: Category.API,
    issue: 193,
  },
  {
    type: 'fix',
    description: 'Fix custom meta being applied twice',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'change',
    description: 'Allow filtering simple hosts',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fix Kanji tokens not being applied for fragmented words',
    category: Category.Texthighlighter,
    issue: 215,
  },
  {
    type: 'add',
    description: 'Add Satori Reader support',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Add NHK news support',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'change',
    description: 'Update documentation for custom parsing',
    category: [Category.Hosts, Category.Documentation],
    issue: 217,
  },
];
