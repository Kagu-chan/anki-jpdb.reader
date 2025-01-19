import { MessageSender } from '@shared/extension';
import { getCardState } from '@shared/jpdb';
import { CardStateUpdatedCommand, UpdateCardStateCommand } from '@shared/messages';
import { BackgroundCommandHandler } from '../lib/background-command-handler';

export class UpdateCardStateCommandHandler extends BackgroundCommandHandler<UpdateCardStateCommand> {
  public readonly command = UpdateCardStateCommand;

  public async handle(sender: MessageSender, vid: number, sid: number): Promise<void> {
    const newCardState = await getCardState(vid, sid);

    new CardStateUpdatedCommand(vid, sid, newCardState).send();
  }
}
