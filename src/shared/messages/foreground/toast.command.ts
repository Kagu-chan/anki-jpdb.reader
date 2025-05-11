import { ForegroundCommand } from '../lib/foreground-command';

export class ToastCommand extends ForegroundCommand<
  [type: 'error' | 'success', message: string, error?: string]
> {
  public readonly key = 'toast';
}
