import { JPDBToken } from '@shared/jpdb/types';
import { Fragment } from '../batches/types';

export abstract class BaseTextHighlighter {
  constructor(
    protected fragments: Fragment[],
    protected tokens: JPDBToken[],
  ) {}

  public abstract apply(): void;
}
