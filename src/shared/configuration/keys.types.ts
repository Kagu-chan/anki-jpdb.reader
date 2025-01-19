import { DeckConfiguration, DiscoverWordConfiguration } from '../anki/types';
import { FilterKeys } from '../types';
import { ConfigurationSchema, Keybind } from './types';

export type ConfigurationNumberKeys = FilterKeys<ConfigurationSchema, number>[];
export type ConfigurationBooleanKeys = FilterKeys<ConfigurationSchema, boolean>[];
export type ConfigurationObjectKeys = FilterKeys<
  ConfigurationSchema,
  Keybind | DeckConfiguration | DiscoverWordConfiguration[]
>[];
