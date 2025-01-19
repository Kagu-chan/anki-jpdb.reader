import { ConfigurationSchema, getConfiguration } from '@shared/configuration';
import { MessageSender } from '@shared/extension';
import { addVocabulary, JPDBSpecialDeckNames, removeVocabulary } from '@shared/jpdb';
import { RunDeckActionCommand, ToastCommand } from '@shared/messages';
import { BackgroundCommandHandler } from '../lib/background-command-handler';

export class RunDeckActionCommandHandler extends BackgroundCommandHandler<RunDeckActionCommand> {
  public readonly command = RunDeckActionCommand;

  public async handle(
    sender: MessageSender,
    vid: number,
    sid: number,
    deck: 'mining' | 'blacklist' | 'neverForget',
    action: 'add' | 'remove',
  ): Promise<void> {
    const deckIdOrName = await this.getDeck(sender, deck);

    if (!deckIdOrName) {
      return;
    }

    const fn = action === 'add' ? addVocabulary : removeVocabulary;

    await fn(deckIdOrName, vid, sid);
  }

  private async getDeck(
    sender: MessageSender,
    key: 'mining' | 'blacklist' | 'neverForget',
  ): Promise<JPDBSpecialDeckNames | number | false> {
    const deckKey = {
      mining: 'jpdbMiningDeck',
      blacklist: 'jpdbBlacklistDeck',
      neverForget: 'jpdbNeverForgetDeck',
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
