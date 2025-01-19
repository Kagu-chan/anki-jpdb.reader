import { MessageSender } from '@shared/extension';
import { LookupTextCommand } from '@shared/messages';
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
