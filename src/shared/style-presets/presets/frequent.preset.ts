import { ConfigurationSchema } from '@shared/configuration/types';
import { resolveColorRule } from '../color';

export const frequentPreset = (
  config: Pick<ConfigurationSchema, 'topXMark' | 'frequentColor'>,
): string => {
  if (!config.topXMark) {
    return '';
  }

  return resolveColorRule('.jpdb-word.frequent', config.frequentColor);
};
