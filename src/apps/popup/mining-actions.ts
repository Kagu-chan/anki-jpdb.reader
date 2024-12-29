import { JPDBCard } from '@shared/jpdb';
import { sendToBackground } from '@shared/messages';
import { KeybindManager } from '../integration/keybind-manager';
import { Registry } from '../integration/registry';

export class MiningActions {
  private _keyManager = new KeybindManager([
    'addToMiningKey',
    'addToBlacklistKey',
    'addToNeverForgetKey',
  ]);

  private _wordstatesSuspended = false;
  private _card?: JPDBCard;

  constructor() {
    const { events } = Registry;

    events.on('addToMiningKey', () => this.addToDeck('mining'));
    events.on('addToBlacklistKey', () => this.addToDeck('blacklist'));
    events.on('addToNeverForgetKey', () => this.addToDeck('neverForget'));
  }

  public activate(context: HTMLElement): void {
    this._card = Registry.getCardFromElement(context);
    this._keyManager.activate();
  }

  public deactivate(): void {
    this._card = undefined;
    this._keyManager.deactivate();
  }

  public async setDecks(decks: {
    mining?: boolean;
    blacklist?: boolean;
    neverForget?: boolean;
  }): Promise<void> {
    const promises = ['mining', 'blacklist', 'neverForget'].map(
      (key: 'mining' | 'blacklist' | 'neverForget') => {
        if (decks[key]) {
          return this.addToDeck(key);
        }

        if (decks[key] === false) {
          return this.removeFromDeck(key);
        }

        return Promise.resolve();
      },
    );

    await Promise.all(promises);

    if (!this._wordstatesSuspended) {
      await this.updateWordStates();
    }
  }

  public suspendUpdateWordStates(): void {
    this._wordstatesSuspended = true;
  }

  public resumeUpdateWordStates(): void {
    this._wordstatesSuspended = false;
    void this.updateWordStates();
  }

  private async updateWordStates(): Promise<void> {
    const { vid, sid } = this._card || {};

    if (!vid || !sid) {
      return;
    }

    await sendToBackground('updateCardState', vid, sid);
  }

  private async addToDeck(key: 'mining' | 'blacklist' | 'neverForget'): Promise<void> {
    const { vid, sid } = this._card || {};

    if (!vid || !sid) {
      return;
    }

    await sendToBackground('runDeckAction', vid, sid, key, 'add');
  }

  private async removeFromDeck(key: 'mining' | 'blacklist' | 'neverForget'): Promise<void> {
    const { vid, sid } = this._card || {};

    if (!vid || !sid) {
      return;
    }

    await sendToBackground('runDeckAction', vid, sid, key, 'remove');
  }
}