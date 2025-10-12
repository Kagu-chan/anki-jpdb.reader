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
  {
    type: 'change',
    description: 'Removed the save button from the settings page and added automatic saving.',
    category: Category.Settings,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description:
      'Fixed an issue where a card state update would set the wrong class on the element.',
    category: Category.Texthighlighter,
    issue: 314,
  },
  {
    type: 'change',
    description: 'The closing keybind for the popup is now configurable (default: Escape).',
    category: Category.Popup,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Allow setting a keybind to switch between satori event sources.',
    category: Category.Parser,
    issue: 307,
  },
  {
    type: 'add',
    description: 'Allow showing an overlay for satori event sources.',
    category: Category.Parser,
    issue: 307,
  },
  {
    type: 'fix',
    description: 'Improved interaction between the extension and FastClick.',
    category: Category.Popup,
    issue: 331,
  },
  {
    type: 'fix',
    description: 'Fixed an issue where words without frequency would be marked as frequent.',
    category: Category.Texthighlighter,
    issue: 364,
  },
];
