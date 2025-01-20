import { ForegroundCommand } from '../lib/foreground-command';

export class SequenceSuccessCommand<TSequenceData> extends ForegroundCommand<
  [sequence: number, data: TSequenceData]
> {
  public readonly key = 'sequenceSuccess';
}
