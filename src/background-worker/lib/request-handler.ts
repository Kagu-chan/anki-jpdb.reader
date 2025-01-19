import { LookupTextCommand } from '@shared/messages';

export interface IRequestHandler<TCommand> {
  handle(command: TCommand): void;
}

export class LookupTextCommandHandler implements IRequestHandler<LookupTextCommand> {
  public handle(command: LookupTextCommand): void {
    console.log('LookupTextCommandHandler.handle', command);
  }
}

export class TabMessageHandler {
  public readonly handlers: IRequestHandler<unknown>[] = [];

  public constructor(...handlers: IRequestHandler<unknown>[]) {
    this.handlers = handlers;
  }

  public listen(): void {}
}
