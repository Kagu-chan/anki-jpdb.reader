import { ParagraphReader } from '../paragraph-reader/paragraph-reader';
import { Paragraph } from './types';

export const getParagraphs = (
  node: Element | Node,
  filter?: (node: Element | Node) => boolean,
): Paragraph[] => {
  return new ParagraphReader(node, filter).read();
};
