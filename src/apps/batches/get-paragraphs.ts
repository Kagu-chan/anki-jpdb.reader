import { recurse } from './recurse';
import { Fragment, Paragraph } from './types';

export const getParagraphs = (
  node: Element | Node,
  filter?: (node: Element | Node) => boolean,
): Paragraph[] => {
  const fragments: Fragment[] = [];
  const paragraphs: Paragraph[] = [];

  recurse(paragraphs, fragments, 0, node, false, filter);

  return paragraphs;
};
