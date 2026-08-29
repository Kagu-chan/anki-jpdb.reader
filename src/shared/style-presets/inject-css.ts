import { ConfigurationSchema } from '@shared/configuration/types';
import { customWordCssPreset } from './presets/custom-word-css.preset';
import { frequentPreset } from './presets/frequent.preset';
import { iPlusOnePreset } from './presets/i-plus-one.preset';

export type InjectCssConfig = Pick<
  ConfigurationSchema,
  'markTopX' | 'frequentColor' | 'markIPlus1' | 'iPlusOneColor' | 'customWordCSS'
>;

const ALWAYS_PRESETS: ((config: InjectCssConfig) => string)[] = [
  frequentPreset,
  iPlusOnePreset,
  customWordCssPreset,
];

export const injectCss = (config: InjectCssConfig): string =>
  ALWAYS_PRESETS.map((preset) => preset(config))
    .filter(Boolean)
    .join('\n');
