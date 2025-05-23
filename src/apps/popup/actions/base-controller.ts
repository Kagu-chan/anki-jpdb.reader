import { JPDBCard } from '@shared/jpdb/types';
import { UpdateCardStateCommand } from '@shared/messages/background/update-card-state.command';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';

export abstract class BaseController {
  public abstract showActions: boolean;

  protected static _suspendUpdateWordStates = false;

  constructor() {
    onBroadcastMessage('configurationUpdated', () => this.applyConfiguration(), true);
  }

  public suspendUpdateWordStates(): void {
    BaseController._suspendUpdateWordStates = true;
  }

  public resumeUpdateWordStates(card: JPDBCard): void {
    BaseController._suspendUpdateWordStates = false;

    this.updateCardState(card);
  }

  public updateCardState(card: JPDBCard): void {
    const { vid, sid } = card;

    if (BaseController._suspendUpdateWordStates) {
      return;
    }

    new UpdateCardStateCommand(vid, sid).send();
  }

  protected abstract applyConfiguration(): Promise<void>;
}
