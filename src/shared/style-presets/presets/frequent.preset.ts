import { ConfigurationSchema } from '@shared/configuration/types';
import { resolveColorRule } from '../color';

export const frequentPreset = (
  config: Pick<ConfigurationSchema, 'markTopX' | 'frequentColor'>,
): string => {
  if (!config.markTopX) {
    return '';
  }

  return resolveColorRule('.jpdb-word.frequent', config.frequentColor);
};
