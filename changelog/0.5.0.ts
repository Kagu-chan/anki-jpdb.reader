import { Category, ChangelogEntry } from './types';

export const _050: ChangelogEntry[] = [
  {
    type: 'add',
    description: 'Published the extension on the Chrome Web Store.',
    category: [Category.Browser, Category.Documentation],
    issue: 'N/A',
  },
  {
    type: 'change',
    description: 'Added the ability to move the currently active tab to the top of the list.',
    category: Category.Parser,
    issue: 108,
  },
  {
    type: 'change',
    description: 'Added the ability to reduce the list of tabs to only the active tab.',
    category: Category.Parser,
    issue: 109,
  },
  {
    type: 'add',
    description: 'Added support for suspended cards and decks.',
    category: [Category.API, Category.Texthighlighter, Category.Parser],
    issue: 133,
  },
  {
    type: 'change',
    description: 'Added the ability to change the states for card state rotation.',
    category: [Category.Texthighlighter, Category.API],
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added a parse page control to web pages.',
    category: [Category.Parser],
    issue: 133,
  },
  {
    type: 'change',
    description: 'Added the ability to assign two keyboard shortcuts to actions.',
    category: [Category.Parser, Category.Texthighlighter],
    issue: 134,
  },
  {
    type: 'add',
    description:
      'Added the ability to change the position of deck and mining actions on the popup.',
    category: Category.Popup,
    issue: 151,
  },
  {
    type: 'fix',
    description: 'Fixed an issue where the card state did not properly update in certain cases.',
    category: [Category.Texthighlighter, Category.API],
    issue: 156,
  },
  {
    type: 'change',
    description: 'Updated the settings page.',
    category: Category.Settings,
    issue: 110,
  },
  {
    type: 'add',
    description: 'Added a changelog.',
    category: [Category.Documentation],
    issue: 156,
  },
];
