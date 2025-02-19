import { getLastError } from '../../extension/get-last-error';
import { tabs } from '../../extension/tabs';
import { Command } from './command';

export abstract class ForegroundCommand<
  TArguments extends unknown[] = [],
  TResult = void,
> extends Command<TArguments> {
  public send<T>(tabId: number, afterCall?: (r: TResult) => T | Promise<T>): void {
    void this.call(tabId, afterCall);
  }

  public call<T>(tabId: number, afterCall?: (r: TResult) => T | Promise<T>): Promise<TResult> {
    const promise = new Promise<TResult>((resolve, reject) => {
      tabs.sendMessage(
        tabId,
        {
          event: this.key,
          command: this.constructor.name,
          isBroadcast: false,
          args: this.arguments,
        },
        (response: TResult) => {
          const lastError = getLastError();

          if (lastError) {
            reject(lastError as Error);
          }

          resolve(response);
        },
      );
    });

    return afterCall
      ? promise.then(async (r) => {
          await afterCall(r);

          return r;
        })
      : promise;
  }
}
