import { getConfiguration } from '@shared/configuration/get-configuration';
import { injectStyle } from '@shared/extension/inject-style';
import { openOptionsPage } from '@shared/extension/open-options-page';
import { MessageSender } from '@shared/extension/types';
import { ParseCommand } from '@shared/messages/background/parse.command';
import { ToastCommand } from '@shared/messages/foreground/toast.command';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';
import { BackgroundCommandHandler } from '../lib/background-command-handler';
import { ParseController } from './parse.controller';

export class ParseCommandHandler extends BackgroundCommandHandler<ParseCommand> {
  public readonly command = ParseCommand;

  private _failToast = new ToastCommand(
    'error',
    'JPDB API key is not set. Please set it in the extension settings.',
  );
  private _injectedTabs = new Set<number>();

  constructor(private _parseController: ParseController) {
    super();
  }

  public async handle(
    sender: MessageSender,
    data: [sequenceId: number, text: string][],
  ): Promise<void> {
    const jpdbApiKey = await getConfiguration('jpdbApiToken', false);

    if (!jpdbApiKey) {
      await this._failToast.call(sender.tab!.id!);
      await openOptionsPage();

      return;
    }

    if (!this._injectedTabs.has(sender.tab!.id!)) {
      onBroadcastMessage(
        'configurationUpdated',
        async () => {
          const customWordCSS = await getConfiguration('customWordCSS', true);

          await injectStyle(sender.tab!.id!, 'word', customWordCSS);
        },
        true,
      );

      this._injectedTabs.add(sender.tab!.id!);
    }

    this._parseController.parseSequences(sender, data);
  }
}
