import { BackgroundCommand } from '../lib/background-command';

export class RunDeckActionCommand extends BackgroundCommand<
  [
    vid: number,
    sid: number,
    key: 'mining' | 'blacklist' | 'neverForget' | 'suspend',
    action: 'add' | 'remove',
    sentence?: string,
  ]
> {
  public readonly key = 'runDeckAction';
}
