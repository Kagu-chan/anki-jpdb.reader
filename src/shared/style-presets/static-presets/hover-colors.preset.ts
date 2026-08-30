import { PresetColor } from '@shared/configuration/types';
import { resolveColorStyle } from '../color';
import { StylePresetCssConfig } from '../types';
import { getActiveColorRules } from './active-color-rules';
import { resolveUnderlineStyle } from './underline-colors.preset';

const RESET_STYLE =
  'color: inherit;\n  background: none;\n  text-decoration: none;\n  text-shadow: none;';

const hoverRule = (
  selector: string,
  color: PresetColor,
  resolveStyle: (color: PresetColor) => string,
): string => {
  const style = resolveStyle(color);

  if (!style) {
    return '';
  }

  return `${selector} {\n  ${RESET_STYLE}\n}\n${selector}:hover {\n  ${style}\n}`;
};

export const hoverColorsPreset = (config: StylePresetCssConfig): string => {
  const resolveStyle = config.stylePresets.includes('underline-colors')
    ? resolveUnderlineStyle
    : resolveColorStyle;

  return getActiveColorRules(config)
    .map(([selector, color]) => hoverRule(selector, color, resolveStyle))
    .filter(Boolean)
    .join('\n');
};
