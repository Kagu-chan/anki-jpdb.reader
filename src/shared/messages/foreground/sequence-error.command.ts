import { ForegroundCommand } from '../lib/foreground-command';

export class SequenceErrorCommand extends ForegroundCommand<[sequence: number, error: string]> {
  public readonly key = 'sequenceError';
}
