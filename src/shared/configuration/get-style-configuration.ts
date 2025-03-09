import { getConfiguration } from './get-configuration';
import { ConfigurationStyleKeys } from './keys.types';

export const getStyleConfiguration = async <K extends ConfigurationStyleKeys>(
  key: K,
  className: string,
  hostElement: HTMLElement,
): Promise<string> => {
  const style = await getConfiguration<K>(key, true);

  return style.replace(/--([\w-]+):\s*([^;]+);/g, (match, ...groups: string[]) => {
    const propName = groups[0];
    const propValue = groups[1];

    hostElement.setAttribute(propName, propValue);

    return `.${className} { --${propName}: attr(${propName} type(<length> | <color> | <number> | <percentage>)); }`;
  });
};
