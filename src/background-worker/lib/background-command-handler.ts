import { MessageSender } from '@shared/extension';
import { BackgroundCommand } from '@shared/messages';
import { PotentialPromise } from '@shared/types';

type ArgumentsFor<T> = T extends BackgroundCommand<infer U, unknown> ? U : never;
type ReturnValueFor<T> = T extends BackgroundCommand<unknown[], infer U> ? U : never;
type CommandCTor<T> = new (...args: ArgumentsFor<T>) => T;

export abstract class BackgroundCommandHandler<T extends BackgroundCommand<unknown[], unknown>> {
  public abstract readonly command: CommandCTor<T>;

  public abstract handle(
    sender: MessageSender,
    ...data: ArgumentsFor<T>
  ): PotentialPromise<ReturnValueFor<T>>;
}
