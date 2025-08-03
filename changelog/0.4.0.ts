import { Category, ChangelogEntry } from './types';

export const _040: ChangelogEntry[] = [
  {
    type: 'add',
    description: 'Added the ability to style based on the current parser.',
    category: [Category.Texthighlighter, Category.Parser],
    issue: 'N/A',
  },
  {
    type: 'change',
    description: 'Changed app styles injection.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'change',
    description: 'Updated styling documentation.',
    category: [Category.Texthighlighter, Category.Documentation],
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fixed hosts configuration.',
    category: [Category.Hosts, Category.Parser],
    issue: 'N/A',
  },
];
