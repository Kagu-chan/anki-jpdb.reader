import { ForegroundCommand } from './foreground-command';

export class ToastCommand extends ForegroundCommand<
  [type: 'error' | 'success', message: string, timeoutDuration?: number]
> {
  public readonly key = 'toast';
}
