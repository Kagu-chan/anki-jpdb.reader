import { getLastError, runtime } from '@shared/extension';
import { BroadcastEventArgs, BroadcastEvents } from '../types/broadcast';

function send<T>(event: string, isBroadcast: boolean, ...args: unknown[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    runtime.sendMessage({ event, isBroadcast, args }, (response: T) => {
      const lastError = getLastError();

      if (lastError && !isBroadcast) {
        reject(lastError as Error);
      }

      resolve(response);
    });
  });
}

export const broadcastToBackground = <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  ...args: BroadcastEventArgs<TEvent>
): void => void send(event, true, ...args);
