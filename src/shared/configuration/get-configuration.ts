import { readStorage } from '../extension/read-storage';
import { DEFAULT_CONFIGURATION } from './default-configuration';
import { parseConfiguration } from './parse-configuration';
import { ConfigurationSchema } from './types';

export const getConfiguration = async <K extends keyof ConfigurationSchema>(
  key: K,
): Promise<ConfigurationSchema[K]> => {
  const defaultValue = DEFAULT_CONFIGURATION[key];
  const stringDefault =
    typeof defaultValue === 'object' ? JSON.stringify(defaultValue) : defaultValue?.toString();
  const value: string = await readStorage(key, stringDefault);

  return parseConfiguration(key, value);
};

const getConfigurationForKeys = async <T extends keyof ConfigurationSchema>(
  keys: T[],
): Promise<Pick<ConfigurationSchema, T>> => {
  const items = await chrome.storage.local.get(keys);
  const result: Pick<ConfigurationSchema, T> = {} as Pick<ConfigurationSchema, T>;

  for (const key of keys) {
    result[key] = parseConfiguration(key, items[key] as string);
  }

  return result;
};

export const getFullConfiguration = (): Promise<ConfigurationSchema> =>
  getConfigurationForKeys(Object.keys(DEFAULT_CONFIGURATION) as (keyof ConfigurationSchema)[]);
