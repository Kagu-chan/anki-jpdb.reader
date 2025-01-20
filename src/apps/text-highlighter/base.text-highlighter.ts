import { JPDBToken } from '@shared/jpdb/types';
import { Fragment } from '../batches/types';

export abstract class BaseTextHighlighter {
  protected fragments: Fragment[];
  protected tokens: JPDBToken[];

  constructor(fragments: Fragment[], tokens: JPDBToken[]) {
    this.fragments = fragments;
    this.tokens = tokens;
  }

  public abstract apply(): void;
}
