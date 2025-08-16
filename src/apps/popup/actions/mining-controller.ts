import { getConfiguration } from '@shared/configuration/get-configuration';
import { JPDBCard } from '@shared/jpdb/types';
import { RunDeckActionCommand } from '@shared/messages/background/run-deck-action.command';
import { BaseController } from './base-controller';

export class MiningController extends BaseController {
  private _miningDeck?: string;
  private _neverForgetDeck?: string;
  private _blacklistDeck?: string;
  private _suspendDeck?: string;
  private _showActions: boolean;

  public get miningDeck(): string | undefined {
    return this._miningDeck;
  }

  public get neverForgetDeck(): string | undefined {
    return this._neverForgetDeck;
  }

  public get blacklistDeck(): string | undefined {
    return this._blacklistDeck;
  }

  public get suspendDeck(): string | undefined {
    return this._suspendDeck;
  }

  public get showActions(): boolean {
    return this._showActions;
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

  protected async applyConfiguration(): Promise<void> {
    this._miningDeck = await getConfiguration('jpdbMiningDeck');
    this._neverForgetDeck = await getConfiguration('jpdbNeverForgetDeck');
    this._blacklistDeck = await getConfiguration('jpdbBlacklistDeck');
    this._suspendDeck = await getConfiguration('jpdbSuspendDeck');
    this._showActions = await getConfiguration('showMiningActions');
  }
}
