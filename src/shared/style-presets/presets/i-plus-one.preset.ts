import { ConfigurationSchema } from '@shared/configuration/types';
import { resolveColorRule } from '../color';

export const iPlusOnePreset = (
  config: Pick<ConfigurationSchema, 'iPlus1Mark' | 'iPlusOneColor'>,
): string => {
  if (!config.iPlus1Mark) {
    return '';
  }

  return resolveColorRule('.jpdb-word.i-plus-one', config.iPlusOneColor);
};
