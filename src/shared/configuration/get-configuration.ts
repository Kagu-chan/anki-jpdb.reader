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
