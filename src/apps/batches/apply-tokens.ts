import { JPDBToken } from '@shared/jpdb/types';
import { TextHighlighter } from '../text-highlighter/text-highlighter';
import { Fragment } from './types';

export const applyTokens = (fragments: Fragment[], tokens: JPDBToken[]): void => {
  new TextHighlighter(fragments, tokens).apply();
};
