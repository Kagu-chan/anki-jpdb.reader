import { MessageSender } from '@shared/extension/types';
import { LookupTextCommand } from '@shared/messages/background/lookup-text.command';
import { BackgroundCommandHandler } from '../lib/background-command-handler';
import { LookupController } from './lookup-controller';

export class LookupTextCommandHandler extends BackgroundCommandHandler<LookupTextCommand> {
  public readonly command = LookupTextCommand;

  constructor(private _lookupController: LookupController) {
    super();
  }

  public handle(sender: MessageSender, text: string): void {
    this._lookupController.lookupText(text);
  }
}
