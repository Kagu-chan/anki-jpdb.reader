import { PresetColor } from '@shared/configuration/types';

const DEFAULT_STYLE = 'color: ${color}';

const toHex = (value: number): string => value.toString(16).padStart(2, '0');

export const hasColor = (
  color: PresetColor,
): color is PresetColor & { r: number; g: number; b: number } =>
  color.r !== undefined && color.g !== undefined && color.b !== undefined;

export const toColorString = (color: PresetColor): string => {
  if (!hasColor(color)) {
    return '';
  }

  const { r, g, b, a } = color;

  if (a === undefined || a >= 1) {
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    if (hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6]) {
      return `#${hex[1]}${hex[3]}${hex[5]}`;
    }

    return hex;
  }

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * An empty color (no r/g/b, no style) resolves to '' - this lets a user unset a state entirely
 * and defer to whatever color the page/community userstyle already applies, instead of us always
 * forcing a `color` declaration that would need `!important` to override.
 */
export const resolveColorStyle = (color: PresetColor): string => {
  if (!color.style && !hasColor(color)) {
    return '';
  }

  return (color.style ?? DEFAULT_STYLE).replaceAll('${color}', toColorString(color));
};

export const resolveColorRule = (selector: string, color: PresetColor): string => {
  const style = resolveColorStyle(color);

  return style ? `${selector} {\n  ${style}\n}` : '';
};
