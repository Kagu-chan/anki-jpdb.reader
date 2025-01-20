import { MessageSender } from '@shared/extension/types';
import { getCardState } from '@shared/jpdb/get-card-state';
import { UpdateCardStateCommand } from '@shared/messages/background/update-card-state.command';
import { CardStateUpdatedCommand } from '@shared/messages/broadcast/card-state-updated.command';
import { BackgroundCommandHandler } from '../lib/background-command-handler';

export class UpdateCardStateCommandHandler extends BackgroundCommandHandler<UpdateCardStateCommand> {
  public readonly command = UpdateCardStateCommand;

  public async handle(sender: MessageSender, vid: number, sid: number): Promise<void> {
    const newCardState = await getCardState(vid, sid);

    new CardStateUpdatedCommand(vid, sid, newCardState).send();
  }
}
