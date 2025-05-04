import { Category, ChangelogEntry } from './types';

export const _050: ChangelogEntry[] = [
  {
    type: 'add',
    description: 'The extension is now on the chrome web store',
    category: [Category.Browser, Category.Documentation],
    issue: 'N/A',
  },
  {
    type: 'change',
    description: 'The currently active tab can now be moved to the top of the list',
    category: Category.Parser,
    issue: 108,
  },
  {
    type: 'change',
    description: 'The list of tabs can now be reduced to only the active tab',
    category: Category.Parser,
    issue: 109,
  },
  {
    type: 'add',
    description: 'Suspended cards and decks are now supported',
    category: [Category.API, Category.Texthighlighter, Category.Parser],
    issue: 133,
  },
  {
    type: 'change',
    description: 'The states for card state rotation can now be changed',
    category: [Category.Texthighlighter, Category.API],
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added a little parse page control to web pages',
    category: [Category.Parser],
    issue: 133,
  },
  {
    type: 'change',
    description: 'Actions can now be assigned two keyboard shortcuts',
    category: [Category.Parser, Category.Texthighlighter],
    issue: 134,
  },
  {
    type: 'add',
    description: 'Allow changing the position of deck and mining actions on the popup',
    category: Category.Popup,
    issue: 151,
  },
  {
    type: 'fix',
    description: 'In certain cases the card state did not properly update',
    category: [Category.Texthighlighter, Category.API],
    issue: 156,
  },
  {
    type: 'change',
    description: 'The settings page has been updated',
    category: Category.Settings,
    issue: 110,
  },
  {
    type: 'add',
    description: 'A changelog is now available',
    category: [Category.Documentation],
    issue: 156,
  },
];
