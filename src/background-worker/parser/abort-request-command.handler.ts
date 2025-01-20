import { MessageSender } from '@shared/extension/types';
import { AbortRequestCommand } from '@shared/messages/background/abort-request.command';
import { SequenceAbortedCommand } from '@shared/messages/foreground/sequence-aborted.command';
import { BackgroundCommandHandler } from '../lib/background-command-handler';
import { ParseController } from './parse.controller';

export class AbortRequestCommandHandler extends BackgroundCommandHandler<AbortRequestCommand> {
  public readonly command = AbortRequestCommand;

  constructor(private _parseController: ParseController) {
    super();
  }

  public async handle(sender: MessageSender, sequence: number): Promise<void> {
    this._parseController.abortSequence(sequence);

    await new SequenceAbortedCommand(sequence).call(sender.tab!.id!);
  }
}
