import { Category, ChangelogEntry } from './types';

export const _060: ChangelogEntry[] = [
  {
    type: 'fix',
    description: 'Fixed the parse page button being shown despite the option being disabled.',
    category: Category.Parser,
    issue: 190,
  },
  {
    type: 'add',
    description: 'Added the release date to the changelog.',
    category: Category.Documentation,
    issue: 199,
  },
  {
    type: 'add',
    description: 'Added a new pattern for the generic texthooker.',
    category: Category.Hosts,
    issue: 'N/A',
  },
  {
    type: 'add',
    description:
      'Added support for the TamperMonkey addon for monolingual dictionaries by Nakura Nakamoto.',
    category: [Category.API, Category.Parser],
    issue: 176,
  },
  {
    type: 'fix',
    description: 'Enhanced token matching for text highlighting.',
    category: Category.Texthighlighter,
    issue: 176,
  },
  {
    type: 'add',
    description: 'Added the ability to add pages and meta definitions for custom parsing.',
    category: Category.Hosts,
    issue: 176,
  },
  {
    type: 'add',
    description: 'Added the ability to mark more frequent words in the text highlighter.',
    category: Category.Texthighlighter,
    issue: 210,
  },
  {
    type: 'fix',
    description: 'Fixed the popup staying when the hovered object is removed from the DOM.',
    category: Category.Popup,
    issue: 164,
  },
  {
    type: 'change',
    description: 'Added the ability to disable automatic parsing for specific pages.',
    category: Category.Hosts,
    issue: 144,
  },
];
