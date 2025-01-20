import { ForegroundCommand } from '../lib/foreground-command';

export class SequenceAbortedCommand extends ForegroundCommand<[sequence: number]> {
  public readonly key = 'sequenceAborted';
}
