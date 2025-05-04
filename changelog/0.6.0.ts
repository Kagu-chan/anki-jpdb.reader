import { Category, ChangelogEntry } from './types';

export const _060: ChangelogEntry[] = [
  {
    type: 'fix',
    description: 'Fix the parse page button shown despite the option being disabled',
    category: Category.Parser,
    issue: 190,
  },
  {
    category: Category.Documentation,
    type: 'add',
    description: 'Added the release date to the changelog',
    issue: 199,
  },
  {
    category: Category.Hosts,
    type: 'add',
    description: 'add new pattern for generic texthooker',
    issue: 'N/A',
  },
  {
    type: 'add',
    description:
      'The TamperMonkey Addon for monolingual dictionaries by Nakura Nakamoto is now supported',
    category: [Category.API, Category.Parser],
    issue: 176,
  },
  {
    type: 'fix',
    description: 'Enhanced the token matching for text highlighting',
    category: Category.Texthighlighter,
    issue: 176,
  },
  {
    type: 'add',
    description: 'Allow marking more frequent words in the text highlighter',
    category: Category.Texthighlighter,
    issue: 210,
  },
  {
    type: 'fix',
    description: 'Fix the popup staying when the hovered object is removed from the DOM',
    category: Category.Popup,
    issue: 164,
  },
];
