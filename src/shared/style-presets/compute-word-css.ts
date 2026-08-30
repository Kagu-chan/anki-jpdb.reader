import { InjectConditionalCssConfig, injectConditionalCss } from './inject-conditional-css';
import { InjectCssConfig, injectCss } from './inject-css';
import { InjectStaticPresetsConfig, injectStaticPresets } from './inject-static-presets';

export type ComputeWordCssConfig = InjectCssConfig &
  InjectConditionalCssConfig &
  InjectStaticPresetsConfig;

export const computeWordCss = (config: ComputeWordCssConfig): string =>
  [injectConditionalCss(config), injectStaticPresets(config), injectCss(config)]
    .filter(Boolean)
    .join('\n');
