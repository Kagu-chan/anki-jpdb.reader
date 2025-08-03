import { Category, ChangelogEntry } from './types';

export const _063: ChangelogEntry[] = [
  {
    type: 'fix',
    description: 'Re-added touchscreen support.',
    category: Category.Popup,
    issue: 63,
  },
  {
    type: 'add',
    description: 'Added the ability to add cycling options to the popup.',
    category: Category.Popup,
    issue: 63,
  },
  {
    type: 'fix',
    description: 'Fixed keybinds not working when the browser was not focused.',
    category: Category.Browser,
    issue: 239,
  },
  {
    type: 'change',
    description: 'Reduced the permissions required by the extension.',
    category: Category.Browser,
    issue: 91,
  },
  {
    type: 'change',
    description: 'Context menus are now skipped on mobile devices or if not granted.',
    category: Category.Browser,
    issue: [59, 60, 99, 100],
  },
];
