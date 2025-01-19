import { BackgroundCommand } from './background-command';

export class ParseCommand extends BackgroundCommand<[data: [sequenceId: number, text: string][]]> {
  public readonly key = 'parse';
}
