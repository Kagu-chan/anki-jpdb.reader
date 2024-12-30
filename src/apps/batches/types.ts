import type { applyTokens } from './apply-tokens';
import type { getParagraphs } from './get-paragraphs';

export type Fragment = {
  node: Text | CDATASection;
  start: number;
  end: number;
  length: number;
  hasRuby: boolean;
};
export type Paragraph = Fragment[];

export type DisplayCategory = 'none' | 'text' | 'ruby' | 'ruby-text' | 'block' | 'inline';
export type RegisterOptions = {
  filter?: (node: Element | Node) => boolean;
  onEmpty?: (node: Element | Node) => void;
  getParagraphsFn?: typeof getParagraphs;
  applyFn?: typeof applyTokens;
};
