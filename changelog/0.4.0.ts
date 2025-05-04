import { Category, ChangelogEntry } from './types';

export const _040: ChangelogEntry[] = [
  {
    type: 'add',
    description: 'Allow styling based on the current parser',
    category: [Category.Texthighlighter, Category.Parser],
    issue: 'N/A',
  },
  {
    type: 'change',
    description: 'Update app styles injection',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'change',
    description: 'Update styling documentation',
    category: [Category.Texthighlighter, Category.Documentation],
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fix hosts configuration',
    category: [Category.Hosts, Category.Parser],
    issue: 'N/A',
  },
];
