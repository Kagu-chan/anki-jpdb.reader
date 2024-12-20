import { getConfiguration } from '@shared/configuration';
import { MessageSender } from '@shared/extension';
import { addVocabulary, getCardState, JPDBSpecialDeckNames, removeVocabulary } from '@shared/jpdb';
import { broadcast, sendToTab, receiveTabMessage } from '@shared/messages';

async function getDeck(
  sender: MessageSender,
  key: 'mining' | 'blacklist' | 'neverForget',
): Promise<JPDBSpecialDeckNames | number | false> {
  const deck = await getConfiguration(
    `jpdb${key[0].toUpperCase()}${key.slice(1)}Deck` as
      | 'jpdbMiningDeck'
      | 'jpdbBlacklistDeck'
      | 'jpdbNeverForgetDeck',
  );

  if (!deck) {
    await sendToTab('toast', sender.tab!.id!, 'error', `No deck selected for ${key}`);

    return false;
  }

  // if deck is a number...
  if (!Number.isNaN(Number(deck))) {
    return Number(deck);
  }

  return deck as JPDBSpecialDeckNames;
}

async function manageDeck(
  sender: MessageSender,
  vid: number,
  sid: number,
  deck: 'mining' | 'blacklist' | 'neverForget',
  action: 'add' | 'remove',
): Promise<void> {
  // TODO: Ignore events when user is not logged in
  const deckIdOrName = await getDeck(sender, deck);

  if (!deckIdOrName) {
    return;
  }

  if (action === 'add') {
    await addVocabulary(deckIdOrName, vid, sid);
    // TODO Sentence, forq and such needs to be implemented. Can we reverse engineer the image api?
  } else {
    await removeVocabulary(deckIdOrName, vid, sid);
  }
}

export const installJpdbCardActions = (): void => {
  receiveTabMessage('updateCardState', async (_, vid: number, sid: number) => {
    const newCardState = await getCardState(vid, sid);

    broadcast('cardStateUpdated', vid, sid, newCardState);
  });

  receiveTabMessage(
    'addToDeck',
    async (
      sender: MessageSender,
      vid: number,
      sid: number,
      // TODO: Add more context!
      deck: 'mining' | 'blacklist' | 'neverForget',
    ) => {
      await manageDeck(sender, vid, sid, deck, 'add');
    },
  );

  receiveTabMessage(
    'removeFromDeck',
    async (
      sender: MessageSender,
      vid: number,
      sid: number,
      // TODO: Add more context!
      deck: 'mining' | 'blacklist' | 'neverForget',
    ) => {
      await manageDeck(sender, vid, sid, deck, 'remove');
    },
  );
};
