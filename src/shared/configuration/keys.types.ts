import { DeckConfiguration, DiscoverWordConfiguration } from '../anki/types';
import { FilterKeys } from '../types';
import { ConfigurationSchema, Keybinds } from './types';

export type ConfigurationNumberKeys = FilterKeys<ConfigurationSchema, number>[];
export type ConfigurationBooleanKeys = FilterKeys<ConfigurationSchema, boolean>[];
export type ConfigurationObjectKeys = FilterKeys<
  ConfigurationSchema,
  Keybinds | DeckConfiguration | DiscoverWordConfiguration[]
>[];

export type ConfigurationStyleKeys = keyof {
  [K in keyof ConfigurationSchema as K extends `${string}CSS` ? K : never]: K;
};
