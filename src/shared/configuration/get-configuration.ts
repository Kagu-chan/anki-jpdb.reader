import { readStorage } from '../extension/read-storage';
import { FilterKeys } from '../types';
import { DEFAULT_CONFIGURATION } from './default-configuration';
import {
  ConfigurationBooleanKeys,
  ConfigurationNumberKeys,
  ConfigurationObjectKeys,
} from './keys.types';
import { ConfigurationSchema, Keybind } from './types';

// Fetch all configs which should be a number, boolean or object
// Use those to properly parse stored values
const NUMBER_KEYS = Object.keys(DEFAULT_CONFIGURATION).filter(
  (key: keyof ConfigurationSchema) => typeof DEFAULT_CONFIGURATION[key] === 'number',
) as ConfigurationNumberKeys;
const BOOLEAN_KEYS = Object.keys(DEFAULT_CONFIGURATION).filter(
  (key: keyof ConfigurationSchema) => typeof DEFAULT_CONFIGURATION[key] === 'boolean',
) as ConfigurationBooleanKeys;
const OBJECT_KEYS = Object.keys(DEFAULT_CONFIGURATION).filter(
  (key: keyof ConfigurationSchema) => typeof DEFAULT_CONFIGURATION[key] === 'object',
) as ConfigurationObjectKeys;

export const getConfiguration = async <K extends keyof ConfigurationSchema>(
  key: K,
  fetchDefault: boolean,
): Promise<ConfigurationSchema[K]> => {
  const defaultValue = fetchDefault ? DEFAULT_CONFIGURATION[key] : undefined;
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const value: string = await readStorage(key, defaultValue?.toString());

  if (NUMBER_KEYS.includes(key as FilterKeys<ConfigurationSchema, number>)) {
    return parseInt(value, 10) as ConfigurationSchema[K];
  }

  if (BOOLEAN_KEYS.includes(key as FilterKeys<ConfigurationSchema, boolean>)) {
    return (value === 'true') as ConfigurationSchema[K];
  }

  if (OBJECT_KEYS.includes(key as FilterKeys<ConfigurationSchema, Keybind>)) {
    try {
      return JSON.parse(value) as ConfigurationSchema[K];
    } catch {
      // Catch broken persisted values and return the default value
      return defaultValue! as ConfigurationSchema[K];
    }
  }

  return value as ConfigurationSchema[K];
};
