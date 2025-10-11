import { ConfigurationSchema } from '@shared/configuration/types';
import { JPDBCard } from '@shared/jpdb/types';
import { RunDeckActionCommand } from '@shared/messages/background/run-deck-action.command';
import { BaseController } from './base-controller';

export class MiningController extends BaseController {
  public get miningDeck(): string | undefined {
    return this.configuration.jpdbMiningDeck;
  }

  public get neverForgetDeck(): string | undefined {
    return this.configuration.jpdbNeverForgetDeck;
  }

  public get blacklistDeck(): string | undefined {
    return this.configuration.jpdbBlacklistDeck;
  }

  public get suspendDeck(): string | undefined {
    return this.configuration.jpdbSuspendDeck;
  }

  public get showActions(): boolean {
    return this.configuration.showMiningActions;
  }

  public addOrRemove(
    action: 'add' | 'remove',
    key: 'mining' | 'blacklist' | 'neverForget' | 'suspend',
    card: JPDBCard,
    sentence?: string,
  ): void {
    const { vid, sid } = card;

    new RunDeckActionCommand(vid, sid, key, action, sentence).send(() =>
      this.updateCardState(card),
    );
  }

  protected getConfigurationKeys(): (keyof ConfigurationSchema)[] {
    return [
      'jpdbMiningDeck',
      'jpdbNeverForgetDeck',
      'jpdbBlacklistDeck',
      'jpdbSuspendDeck',
      'showMiningActions',
    ];
  }
}
