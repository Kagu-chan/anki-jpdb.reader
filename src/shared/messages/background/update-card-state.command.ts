import { BackgroundCommand } from '../lib/background-command';

export class UpdateCardStateCommand extends BackgroundCommand<[vid: number, sid: number]> {
  public readonly key = 'updateCardState';
}
