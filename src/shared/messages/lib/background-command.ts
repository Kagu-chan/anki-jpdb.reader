import { getLastError } from '../../extension/get-last-error';
import { runtime } from '../../extension/runtime';
import { Command } from '../lib/command';

export abstract class BackgroundCommand<
  TArguments extends unknown[] = [],
  TResult = void,
> extends Command<TArguments> {
  public send<T>(afterCall?: (r: TResult) => T | Promise<T>): void {
    void this.call(afterCall);
  }

  public call<T>(afterCall?: (r: TResult) => T | Promise<T>): Promise<TResult> {
    const promise = new Promise<TResult>((resolve, reject) => {
      runtime.sendMessage(
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
