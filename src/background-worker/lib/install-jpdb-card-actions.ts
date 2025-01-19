import { getConfiguration } from '@shared/configuration';
import { MessageSender } from '@shared/extension';
import {
  addVocabulary,
  getCardState,
  JPDBGrade,
  JPDBSpecialDeckNames,
  removeVocabulary,
  review,
} from '@shared/jpdb';
import { broadcast, receiveTabMessage, ToastCommand } from '@shared/messages';

async function getDeck(
  sender: MessageSender,
  key: 'mining' | 'blacklist' | 'neverForget',
): Promise<JPDBSpecialDeckNames | number | false> {
  const deck = await getConfiguration(
    `jpdb${key[0].toUpperCase()}${key.slice(1)}Deck` as
      | 'jpdbMiningDeck'
      | 'jpdbBlacklistDeck'
      | 'jpdbNeverForgetDeck',
    true,
  );

  if (!deck) {
    await new ToastCommand('error', `No deck selected for ${key}`).call(sender.tab!.id!);

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
  const deckIdOrName = await getDeck(sender, deck);
  const fn = action === 'add' ? addVocabulary : removeVocabulary;

  if (!deckIdOrName) {
    return;
  }

  await fn(deckIdOrName, vid, sid);
}

export const installJpdbCardActions = (): void => {
  receiveTabMessage('updateCardState', async (_, vid: number, sid: number) => {
    const newCardState = await getCardState(vid, sid);

    broadcast('cardStateUpdated', vid, sid, newCardState);
  });

  receiveTabMessage(
    'runDeckAction',
    async (
      sender: MessageSender,
      vid: number,
      sid: number,
      deck: 'mining' | 'blacklist' | 'neverForget',
      action: 'add' | 'remove',
    ) => {
      await manageDeck(sender, vid, sid, deck, action);
    },
  );

  receiveTabMessage('gradeCard', (_, vid: number, sid: number, grade: JPDBGrade) =>
    review(grade, vid, sid),
  );
};
