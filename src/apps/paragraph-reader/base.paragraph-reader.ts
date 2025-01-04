import { Paragraph } from '../batches/types';

export abstract class BaseParagraphReader {
  constructor(
    protected node: Element | Node,
    protected filter?: (node: Element | Node) => boolean,
  ) {}

  public abstract read(): Paragraph[];
}
