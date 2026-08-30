const dedent = (text: string): string => {
  const lines = text.split('\n');
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^ */)![0].length);
  const minIndent = indents.length ? Math.min(...indents) : 0;

  return lines
    .map((line) => line.slice(minIndent))
    .join('\n')
    .trim();
};

export const css = (strings: TemplateStringsArray, ...values: (string | number)[]): string =>
  dedent(strings.reduce((result, part, i) => `${result}${part}${values[i] ?? ''}`, ''));
