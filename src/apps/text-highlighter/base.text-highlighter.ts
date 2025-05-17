import { JPDBToken } from '@shared/jpdb/types';
import { Fragment } from '../batches/types';
import { TextHighlighterOptions } from './types';

export abstract class BaseTextHighlighter {
  constructor(
    protected fragments: Fragment[],
    protected tokens: JPDBToken[],
    protected options: TextHighlighterOptions,
  ) {}

  public abstract apply(): void;
}
