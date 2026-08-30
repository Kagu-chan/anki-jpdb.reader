import {
  AddedObserverOptions,
  CustomHostMeta,
  ObserverDefinition,
  VisibleObserverOptions,
} from './public-api';

export { AddedObserverOptions, ObserverDefinition, VisibleObserverOptions };

export type AdditionalHostMeta = Omit<CustomHostMeta, 'auto' | 'allFrames'> &
  Required<Pick<CustomHostMeta, 'auto' | 'allFrames'>>;

type PredefinedHostMetaCommon = {
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
};

/** A predefined host meta entry driving a single parser. */
export type SingleParserHostMeta = AdditionalHostMeta &
  PredefinedHostMetaCommon & {
    /**
     * Optional custom parser implementation to use.
     */
    custom?:
      | 'MokuroParser'
      | 'MokuroLegacyParser'
      | 'ReadwokParser'
      | 'TtsuParser'
      | 'ExStaticParser'
      | 'SatoriReaderParser';
  };

/**
 * A predefined host meta entry driving multiple independent parsers sharing the same host,
 * lifecycle (`auto`/`allFrames`/`disabled`) and injected `css`. Each entry in `parsers` gets its
 * own parser instance. Not available for entries using `custom`, since custom parsers manage
 * their own observer wiring rather than reading it generically from an `ObserverDefinition`.
 */
export type MultiParserHostMeta = Omit<AdditionalHostMeta, keyof ObserverDefinition> &
  PredefinedHostMetaCommon & {
    parsers: ObserverDefinition[];
  };

export type PredefinedHostMeta = SingleParserHostMeta | MultiParserHostMeta;

export type HostMeta = AdditionalHostMeta | PredefinedHostMeta;

/** A `HostMeta` after any `MultiParserHostMeta` entry has been expanded into individual parsers. */
export type FlatHostMeta = AdditionalHostMeta | SingleParserHostMeta;
