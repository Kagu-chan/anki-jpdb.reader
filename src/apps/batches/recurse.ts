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
): void => {
  if (node instanceof Element && node.hasAttribute('ajb')) {
    return;
  }

  const display = displayCategory(node);
  const checkBlock = (): void => {
    if (display === 'block') {
      breakParagraph(paragraphs, fragments);

      fragments = [];
      offset = 0;
    }
  };

  checkBlock();

  if (display === 'none' || display === 'ruby-text' || filter?.(node) === false) {
    return;
  }

  if (display === 'text') {
    return pushText(fragments, offset, node as Text | CDATASection, hasRuby);
  }

  if (display === 'ruby') {
    hasRuby = true;
  }

  for (const child of node.childNodes) {
    recurse(paragraphs, fragments, offset, child, hasRuby, filter);
  }

  if (display === 'block') {
    checkBlock();
  }
};
