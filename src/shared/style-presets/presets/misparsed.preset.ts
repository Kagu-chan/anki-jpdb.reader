import { ConfigurationSchema } from '@shared/configuration/types';
import { resolveColorRule } from '../color';

export const misparsedPreset = (
  config: Pick<ConfigurationSchema, 'highlightMisparsed' | 'misparsedColor'>,
): string => {
  if (!config.highlightMisparsed) {
    return '';
  }

  return resolveColorRule('.jpdb-word.misparsed', config.misparsedColor);
};
