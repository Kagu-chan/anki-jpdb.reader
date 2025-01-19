import { JPDBToken } from '@shared/jpdb/types';
import { Registry } from '../integration/registry';
import { Fragment } from './types';

export const applyTokens = (fragments: Fragment[], tokens: JPDBToken[]): void => {
  new Registry.textHighlighter(fragments, tokens).apply();
};
