import { writeStorage } from '../extension/write-storage';
import { ConfigurationSchema } from './types';

export const setConfiguration = async <K extends keyof ConfigurationSchema>(
  key: K,
  value: ConfigurationSchema[K],
): Promise<void> => {
  await writeStorage(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
};
