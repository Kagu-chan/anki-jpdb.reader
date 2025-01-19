import { BackgroundCommand } from './background-command';

export class RunDeckActionCommand extends BackgroundCommand<
  [vid: number, sid: number, key: 'mining' | 'blacklist' | 'neverForget', action: 'add' | 'remove']
> {
  public readonly key = 'runDeckAction';
}
