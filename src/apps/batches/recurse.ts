import { breakParagraph } from './break-paragraph';
import { displayCategory } from './display-category';
import { pushText } from './push-text';
import { Fragment, Paragraph } from './types';

export const recurse = (
  paragraphs: Paragraph[],
  fragments: Fragment[],
  offset: number,
  node: Element | Node,
  hasRuby: boolean,
  filter?: (node: Element | Node) => boolean,
): number => {
  if (node instanceof Element && node.hasAttribute('ajb')) {
    return offset;
  }

  const display = displayCategory(node);
  const breakIfBlock = (): void => {
    if (display === 'block') {
      offset = breakParagraph(paragraphs, fragments);

      fragments = [];
    }
  };

  breakIfBlock();

  if (display === 'none' || display === 'ruby-text' || filter?.(node) === false) {
    return offset;
  }

  if (display === 'text') {
    return pushText(fragments, offset, node as Text | CDATASection, hasRuby);
  }

  if (display === 'ruby') {
    hasRuby = true;
  }

  for (const child of node.childNodes) {
    offset = recurse(paragraphs, fragments, offset, child, hasRuby, filter);
  }

  if (display === 'block') {
    breakIfBlock();
  }

  return offset;
};
