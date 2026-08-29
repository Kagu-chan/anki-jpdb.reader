import { ConfigurationSchema } from '@shared/configuration/types';
import { resolveColorRule } from '../color';

export const iPlusOnePreset = (
  config: Pick<ConfigurationSchema, 'markIPlus1' | 'iPlusOneColor'>,
): string => {
  if (!config.markIPlus1) {
    return '';
  }

  return resolveColorRule('.jpdb-word.i-plus-one', config.iPlusOneColor);
};
