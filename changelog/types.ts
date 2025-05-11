export type Version =
  | '0.1.0'
  | '0.1.1'
  | '0.1.2'
  | '0.2.0'
  | '0.2.1'
  | '0.3.0'
  | '0.3.1'
  | '0.4.0'
  | '0.5.0'
  | '0.6.0'
  | '0.6.1';

export type ChangeType = 'add' | 'change' | 'deprecate' | 'remove' | 'fix' | 'chore';
export enum Category {
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
export type ChangelogEntry = {
  type: ChangeType;
  description: string;
  category: Category | [Category, ...Category[]];
  issue: number | [number, ...number[]] | 'N/A';
};
export type Changelog = Record<Version, ChangelogEntry[]>;
