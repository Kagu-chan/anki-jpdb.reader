import { runtime } from '@shared/extension/runtime';
import { MessageSender } from '@shared/extension/types';
import { BackgroundCommand } from '@shared/messages/lib/background-command';
import { BackgroundCommandHandler } from './background-command-handler';

type Request = {
  command: string;
  args: unknown[];
};
type Response =
  | {
      success: true;
      result: unknown;
    }
  | {
      success: false;
      error: Error;
    };

export class BackgroundCommandHandlerCollection {
  private readonly handlers = new Map<
    string,
    BackgroundCommandHandler<BackgroundCommand<unknown[], unknown>>
  >();

  public constructor(
    ...handlers: BackgroundCommandHandler<BackgroundCommand<unknown[], unknown>>[]
  ) {
    handlers.forEach((handler) => {
      this.handlers.set(handler.command.name, handler);
    });
  }

  public register(handler: BackgroundCommandHandler<BackgroundCommand<unknown[], unknown>>): void {
    this.handlers.set(handler.command.name, handler);
  }

  public listen(): void {
    runtime.onMessage.addListener(
      (request: Request, sender: MessageSender, sendResponse: (response: Response) => void) => {
        const handler = this.handlers.get(request.command);

        if (!handler) {
          return false;
        }

        const handlerResult = handler.handle(sender, ...request.args);
        const promise = Promise.resolve(handlerResult);

        promise
          .then((result) => {
            sendResponse({ success: true, result });
          })
          .catch((error: Error) => {
            sendResponse({ success: false, error });
          });

        return true;
      },
    );
  }
}
