import { JPDBDeck } from '../../jpdb/types';
import { BroadcastCommand } from '../lib/broadcast-command';

export class DeckListUpdatedCommand extends BroadcastCommand<[decks: JPDBDeck[]]> {
  public readonly key = 'deckListUpdated';
}
