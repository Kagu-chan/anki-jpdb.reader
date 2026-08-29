export const css = (strings: TemplateStringsArray, ...values: (string | number)[]): string =>
  strings.reduce((result, part, i) => `${result}${part}${values[i] ?? ''}`, '');
