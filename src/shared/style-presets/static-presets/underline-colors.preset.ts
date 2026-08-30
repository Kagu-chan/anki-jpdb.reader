import { PresetColor } from '@shared/configuration/types';
import { toColorString } from '../color';
import { StylePresetCssConfig } from '../types';
import { getActiveColorRules } from './active-color-rules';

const UNDERLINE_STYLE =
  'color: inherit;\n  text-decoration: underline;\n  text-decoration-color: ${color};';

export const resolveUnderlineStyle = (color: PresetColor): string => {
  const colorString = toColorString(color);

  return colorString ? UNDERLINE_STYLE.replaceAll('${color}', colorString) : '';
};

const underlineRule = (selector: string, color: PresetColor): string => {
  const style = resolveUnderlineStyle(color);

  return style ? `${selector} {\n  ${style}\n}` : '';
};

export const underlineColorsPreset = (config: StylePresetCssConfig): string =>
  getActiveColorRules(config)
    .map(([selector, color]) => underlineRule(selector, color))
    .filter(Boolean)
    .join('\n');
