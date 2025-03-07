import { getConfiguration } from '@shared/configuration/get-configuration';
import { ConfigurationSchema } from '@shared/configuration/types';
import { MessageSender } from '@shared/extension/types';
import { addVocabulary } from '@shared/jpdb/add-vocabulary';
import { removeVocabulary } from '@shared/jpdb/remove-vocabulary';
import { setCardSentence } from '@shared/jpdb/set-card-sentence';
import { JPDBSpecialDeckNames } from '@shared/jpdb/types';
import { RunDeckActionCommand } from '@shared/messages/background/run-deck-action.command';
import { ToastCommand } from '@shared/messages/foreground/toast.command';
import { BackgroundCommandHandler } from '../lib/background-command-handler';

export class RunDeckActionCommandHandler extends BackgroundCommandHandler<RunDeckActionCommand> {
  public readonly command = RunDeckActionCommand;

  public async handle(
    sender: MessageSender,
    vid: number,
    sid: number,
    deck: 'mining' | 'blacklist' | 'neverForget' | 'suspend',
    action: 'add' | 'remove',
    sentence?: string,
  ): Promise<void> {
    const deckIdOrName = await this.getDeck(sender, deck);
    const addToForqOnAdd = await getConfiguration('jpdbAddToForq', true);
    const addSentence = await getConfiguration('setSentences', true);
    const forqDeck = addToForqOnAdd ? await this.getDeck(sender, 'forq') : false;

    if (!deckIdOrName) {
      return;
    }

    const fn = action === 'add' ? addVocabulary : removeVocabulary;

    await fn(deckIdOrName, vid, sid);

    if (forqDeck && deck === 'mining') {
      await fn(forqDeck, vid, sid);
    }

    if (addSentence && sentence?.length && action === 'add' && deck === 'mining') {
      await setCardSentence(vid, sid, sentence);
    }
  }

  private async getDeck(
    sender: MessageSender,
    key: 'mining' | 'blacklist' | 'neverForget' | 'forq' | 'suspend',
  ): Promise<JPDBSpecialDeckNames | number | false> {
    const deckKey = {
      mining: 'jpdbMiningDeck',
      blacklist: 'jpdbBlacklistDeck',
      neverForget: 'jpdbNeverForgetDeck',
      forq: 'jpdbForqDeck',
      suspend: 'jpdbSuspendDeck',
    }[key] as keyof ConfigurationSchema;

    const deck = await getConfiguration(deckKey, true);

    if (!deck) {
      await new ToastCommand('error', `No deck selected for ${key}`).call(sender.tab!.id!);

      return false;
    }

    if (!Number.isNaN(Number(deck))) {
      return Number(deck);
    }

    return deck as JPDBSpecialDeckNames;
  }
}
