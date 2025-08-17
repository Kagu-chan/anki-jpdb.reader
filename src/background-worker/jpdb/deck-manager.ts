import { getConfiguration } from '@shared/configuration/get-configuration';
import { listUserDecks } from '@shared/jpdb/list-user-decks';
import { JPDBDeck } from '@shared/jpdb/types';
import { DeckListUpdatedCommand } from '@shared/messages/broadcast/deck-list-updated.command';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';

export class DeckManager {
  private jpdbApiToken: string | null = null;
  private internalDecks: JPDBDeck[] = [
    { id: 'blacklist', name: '[Blacklist]' },
    { id: 'never-forget', name: '[Never forget]' },
    { id: 'forq', name: '[ForQ]' },
  ];
  private decks: JPDBDeck[] = [];
  private managableDecks: JPDBDeck[] = [];

  constructor() {
    onBroadcastMessage(
      'configurationUpdated',
      async () => {
        const jpdbApiToken = await getConfiguration('jpdbApiToken');

        if (jpdbApiToken === this.jpdbApiToken) {
          return;
        }

        this.jpdbApiToken = jpdbApiToken;

        if (this.jpdbApiToken) {
          await this.loadDecks();
        }
      },
      true,
    );
  }

  public async loadDecks(): Promise<void> {
    this.decks = [...this.internalDecks, ...(await this.fetchDecks())];
    this.managableDecks = this.decks.filter(
      (deck) => !deck.is_built_in || typeof deck.id === 'string',
    );

    new DeckListUpdatedCommand(this.managableDecks).send();
  }

  private async fetchDecks(): Promise<JPDBDeck[]> {
    return await listUserDecks(
      [
        'id',
        'name',
        'vocabulary_count',
        'word_count',
        'vocabulary_known_coverage',
        'vocabulary_in_progress_coverage',
        'is_built_in',
      ],
      {
        apiToken: this.jpdbApiToken!,
      },
    );
  }
}
