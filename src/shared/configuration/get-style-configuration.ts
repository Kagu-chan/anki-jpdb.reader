import { getStyleUrl } from '../extension/get-style-url';
import { getConfiguration } from './get-configuration';
import { ConfigurationStyleKeys } from './keys.types';

export const getStyleConfiguration = async <K extends ConfigurationStyleKeys>(
  key: K,
): Promise<string> => {
  let style = await getConfiguration<K>(key, true);
  const replacements: string[] | null = style.match(/--fn-\w+:\s*[^;]+;/g);

  for (const replacement of replacements || []) {
    const [, fn, param] = /--fn-(\w+):\s*([^;]+);/.exec(replacement)!;
    const path = `fn/${fn}/${param}`;
    const url = getStyleUrl(path);

    try {
      const response = await fetch(url);
      const css = await response.text();
      const lines = css.split('\n').slice(1, -1);

      style = style.replace(replacement, lines.join('\n'));
    } catch (_error: unknown) {
      // eslint-disable-next-line no-console
      console.error(`Failed to load css function: ${fn}/${param}`);
    }
  }

  return style;
};
