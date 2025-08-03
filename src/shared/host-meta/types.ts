import { CustomHostMeta, AddedObserverOptions, VisibleObserverOptions } from './public-api';

export { AddedObserverOptions, VisibleObserverOptions };

export type AdditionalHostMeta = Omit<CustomHostMeta, 'auto' | 'allFrames'> &
  Required<Pick<CustomHostMeta, 'auto' | 'allFrames'>>;

export type PredefinedHostMeta = AdditionalHostMeta & {
  /**
   * Parser configuration id. This is used to identify the parser internally.
   * It should be unique and not change over time.
   */
  id: string;

  /**
   * The name of the parser to use. This is used to identify the parser in the UI.
   */
  name: string;

  /**
   * The description of the parser. This is used to describe the parser in the UI.
   */
  description: string;

  /**
   * If not set or false, the parser is always active. If set true, the user can opt out and disable the parser.
   */
  optOut?: boolean;

  /**
   * Optional custom parser implementation to use.
   */
  custom?:
    | 'BunproParser'
    | 'MokuroParser'
    | 'MokuroLegacyParser'
    | 'ReadwokParser'
    | 'TtsuParser'
    | 'ExStaticParser'
    | 'SatoriReaderParser';
};

export type HostMeta = AdditionalHostMeta | PredefinedHostMeta;
