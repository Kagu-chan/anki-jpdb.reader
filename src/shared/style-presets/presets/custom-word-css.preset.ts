import { ConfigurationSchema } from '@shared/configuration/types';

export const customWordCssPreset = (config: Pick<ConfigurationSchema, 'customWordCSS'>): string =>
  config.customWordCSS ?? '';
