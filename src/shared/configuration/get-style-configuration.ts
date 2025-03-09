import { displayToast } from '../dom/display-toast';
import { getStyleUrl } from '../extension/get-style-url';
import { getConfiguration } from './get-configuration';
import { ConfigurationStyleKeys } from './keys.types';

export const getStyleConfiguration = async <K extends ConfigurationStyleKeys>(
  key: K,
): Promise<string> => {
  let style = await getConfiguration<K>(key, true);
  const replacements: string[] | null = style.match(/--reset-colors:\s*([^;]+);/g);

  for (const replacement of replacements || []) {
    const color = /--reset-colors:\s*([^;]+);/.exec(replacement);

    if (color) {
      const colorValue = color[1];
      const url = getStyleUrl(`reset_${colorValue}`);

      try {
        const response = await fetch(url);
        const css = await response.text();
        const lines = css.split('\n').slice(1, -1);

        style = style.replace(replacement, lines.join('\n'));
      } catch (_error: unknown) {
        displayToast('error', `Unknown color preset: ${colorValue}`);
      }
    }
  }

  return style;
};
