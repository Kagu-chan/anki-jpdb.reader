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
    description:
      'Added the option to classify card states into Unmined, New, Learning, and Known categories.',
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
  {
    type: 'add',
    description: 'Added a delay option for automatic parser initialization.',
    category: Category.Hosts,
    issue: 238,
  },
  {
    type: 'fix',
    description: 'Fixed bunpro not parsing on lessons.',
    category: Category.Hosts,
    issue: 61,
  },
  {
    type: 'add',
    description: 'Show the extension version in the popup and settings page.',
    category: Category.Settings,
    issue: 'N/A',
  },
  {
    type: 'chore',
    description: 'Prepare the Satori event source toggle to be reused across parsers.',
    category: Category.Parser,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Fixed the Mokuro parser no longer working after a Mokuro website update.',
    category: Category.Parser,
    issue: 397,
  },
  {
    type: 'add',
    description: 'Added parsing for the Bunpro quiz/review question area.',
    category: Category.Hosts,
    issue: 400,
    coauthor: 'tomboblombo',
  },
  {
    type: 'add',
    description: 'Added parsing of JPDB example sentences on review and vocabulary pages.',
    category: Category.Hosts,
    issue: 'N/A',
    coauthor: 'tomboblombo',
  },
  {
    type: 'change',
    description:
      'Updated documentation for the current set of automatically parsed apps and sites.',
    category: Category.Documentation,
    issue: 'N/A',
  },
  {
    type: 'add',
    description:
      'Added configurable style presets for word coloring, frequent/i+1/misparsed/pitch-accent highlighting.',
    category: Category.Texthighlighter,
    issue: 143,
  },
  {
    type: 'add',
    description: 'Added per-category furigana visibility settings.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added the ability to customize every word/furigana style preset color.',
    category: Category.Settings,
    issue: 'N/A',
  },
  {
    type: 'change',
    description:
      'Reworked "Mark the top X words" and "Mark I+1 sentences" to key off unmined words instead of new words, with separate options to also include all other states.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Add textfeed and textlog as parser pattern.',
    category: Category.Parser,
    issue: 'N/A',
    coauthor: 'bpwhelan',
  },
  {
    type: 'chore',
    description: 'Credit coauthors in the changelog.',
    category: Category.Documentation,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added static style presets.',
    category: Category.Texthighlighter,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added a button to preview the fully computed word CSS in Settings.',
    category: Category.Settings,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description:
      'Fixed the settings preview overlay overflowing the screen and not blocking the page behind it, and added a copy-to-clipboard button to it.',
    category: Category.Settings,
    issue: 'N/A',
  },
  {
    type: 'add',
    description: 'Added a color picker for style-preset colors.',
    category: Category.Settings,
    issue: 142,
  },
  {
    type: 'fix',
    description: 'Fixed the ttsu parser not parsing the book content after a page reload.',
    category: Category.Parser,
    issue: 'N/A',
  },
  {
    type: 'fix',
    description: 'Frequency rank is now reevaluated on card state changes.',
    category: Category.Texthighlighter,
    issue: 383,
  },
];
