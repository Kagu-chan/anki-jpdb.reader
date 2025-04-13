type Version =
  | '0.1.0'
  | '0.1.1'
  | '0.1.2'
  | '0.2.0'
  | '0.2.1'
  | '0.3.0'
  | '0.3.1'
  | '0.4.0'
  | '0.5.0';

type ChangeType = 'add' | 'change' | 'deprecate' | 'remove' | 'fix' | 'chore';
enum Category {
  Platform = 'Platform',
  Browser = 'Browser',
  Parser = 'Parser',
  Texthighlighter = 'Texthighlighter',
  API = 'API',
  Documentation = 'Documentation',
  Hosts = 'Hosts',
  Popup = 'Popup',
  Settings = 'Settings',
}
type ChangelogEntry = {
  type: ChangeType;
  description: string;
  category: Category | [Category, ...Category[]];
  issue: number | [number, ...number[]] | 'N/A';
};
type Changelog = Record<Version, ChangelogEntry[]>;

const changelog: Changelog = {
  '0.1.0': [
    {
      type: 'add',
      description: 'Initial release with basic functionality',
      category: Category.Browser,
      issue: 'N/A',
    },
  ],
  '0.1.1': [
    {
      type: 'add',
      description: 'Allow hiding the popup after unhovering the related token',
      category: Category.Popup,
      issue: 69,
    },
    {
      type: 'add',
      description: 'Mark linux as compatible operating system',
      category: Category.Platform,
      issue: 'N/A',
    },
  ],
  '0.1.2': [
    {
      type: 'fix',
      description: 'Single words can now be parsed',
      category: Category.Parser,
      issue: 72,
    },
  ],
  '0.2.0': [
    {
      type: 'add',
      description: 'Added support for firefox',
      category: Category.Browser,
      issue: 58,
    },
  ],
  '0.2.1': [
    {
      type: 'chore',
      description: 'Prepare extension store releases',
      category: Category.Browser,
      issue: 58,
    },
  ],
  '0.3.0': [
    {
      type: 'fix',
      description: 'Furigana will no longer be copied when looking up a word',
      category: [Category.Texthighlighter, Category.API],
      issue: 56,
    },
    {
      type: 'add',
      description: 'Words can now be added to FORQ',
      category: Category.API,
      issue: 64,
    },
    {
      type: 'add',
      description: 'Sentences can now be set on JPDB',
      category: Category.API,
      issue: 65,
    },
    {
      type: 'add',
      description: 'Added support for Pitch Accent',
      category: Category.Texthighlighter,
      issue: 55,
    },
  ],
  '0.3.1': [
    { type: 'chore', description: 'Fix release references', category: Category.Browser, issue: 58 },
  ],
  '0.4.0': [
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
  ],
  '0.5.0': [
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
  ],
};

export default changelog;
