import { BackgroundCommand } from '../lib/background-command';

export class LookupTextCommand extends BackgroundCommand<[text: string]> {
  public readonly key = 'lookupText';
}
