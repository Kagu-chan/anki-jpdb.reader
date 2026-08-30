import { ConfigurationSchema } from '@shared/configuration/types';
import { InjectConditionalCssConfig } from './inject-conditional-css';
import { InjectCssConfig } from './inject-css';

export type StylePresetCssConfig = InjectCssConfig &
  InjectConditionalCssConfig &
  Pick<ConfigurationSchema, 'stylePresets'>;

export type StylePreset = {
  id: string;
  name: string;
  description: string;
  css: (config: StylePresetCssConfig) => string;
};
