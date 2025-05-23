import { Category, ChangelogEntry } from './types';

export const _063: ChangelogEntry[] = [
  {
    type: 'fix',
    description: 'Readded touchscreen support',
    category: Category.Popup,
    issue: 63,
  },
  {
    type: 'add',
    description: 'Allow adding cycling options to the popup',
    category: Category.Popup,
    issue: 63,
  },
  {
    type: 'fix',
    description: 'Keybinds did not work when the browser was not focused',
    category: Category.Browser,
    issue: 239,
  },
  {
    type: 'change',
    description: 'Reduced the permission the extension requires',
    category: Category.Browser,
    issue: 91,
  },
  {
    type: 'change',
    description: 'Skip context menus on mobile devices or if not granted',
    category: Category.Browser,
    issue: [59, 60, 99, 100],
  },
];
