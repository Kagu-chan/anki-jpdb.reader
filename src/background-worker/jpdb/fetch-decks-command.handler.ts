import { FetchDecksCommand } from '@shared/messages/background/fetch-decks.command';
import { BackgroundCommandHandler } from '../lib/background-command-handler';
import { DeckManager } from './deck-manager';

export class FetchDecksCommandHandler extends BackgroundCommandHandler<FetchDecksCommand> {
  public readonly command = FetchDecksCommand;

  constructor(private _deckManager: DeckManager) {
    super();
  }

  public async handle(): Promise<void> {
    await this._deckManager.loadDecks();
  }
}
