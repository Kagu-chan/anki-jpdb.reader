import { Fragment } from './types';

export const pushText = (
  fragments: Fragment[],
  offset: number,
  text: Text | CDATASection,
  hasRuby: boolean,
): number => {
  // Ignore empty text nodes, as well as whitespace at the beginning of the run
  if (text.data.length > 0 && !(fragments.length === 0 && text.data.trim().length === 0)) {
    fragments.push({
      start: offset,
      length: text.length,
      end: (offset += text.length),
      node: text,
      hasRuby,
    });
  }

  return offset;
};
