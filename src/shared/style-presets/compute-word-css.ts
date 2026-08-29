import { InjectConditionalCssConfig, injectConditionalCss } from './inject-conditional-css';
import { InjectCssConfig, injectCss } from './inject-css';

export type ComputeWordCssConfig = InjectCssConfig & InjectConditionalCssConfig;

export const computeWordCss = (config: ComputeWordCssConfig): string =>
  [injectConditionalCss(config), injectCss(config)].filter(Boolean).join('\n');
