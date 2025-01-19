import { getLastError, tabs } from '@shared/extension';
import { BroadcastEventArgs, BroadcastEvents } from '../types/broadcast';

function send<T>(
  event: string,
  tabId: number,
  isBroadcast: boolean,
  ...args: unknown[]
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    tabs.sendMessage(tabId, { event, isBroadcast, args }, (response: T) => {
      const lastError = getLastError();

      if (lastError && !isBroadcast) {
        reject(lastError as Error);
      }

      resolve(response);
    });
  });
}

export const broadcastToTab = <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  tabId: number,
  ...args: BroadcastEventArgs<TEvent>
): void => void send(event, tabId, true, ...args);
