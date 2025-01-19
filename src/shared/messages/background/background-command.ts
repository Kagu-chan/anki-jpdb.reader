import { getLastError, runtime } from '@shared/extension';
import { Command } from '../lib/command';

export abstract class BackgroundCommand<
  TArguments extends unknown[] = [],
  TResult = void,
> extends Command<TArguments, TResult> {
  public call<T>(afterCall?: (r: TResult) => T | Promise<T>): Promise<TResult> {
    const promise = new Promise<TResult>((resolve, reject) => {
      runtime.sendMessage(
        {
          event: this.key,
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
