import { BackgroundCommand } from './background-command';

export class AbortRequestCommand extends BackgroundCommand<[sequence: number]> {
  public readonly key = 'abortRequest';
}
