import { ForegroundCommand } from './foreground-command';

export class SequenceSuccessCommand<TSequenceData> extends ForegroundCommand<
  [sequence: number, data: TSequenceData]
> {
  public readonly key = 'sequenceSuccess';
}
