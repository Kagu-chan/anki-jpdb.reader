import { getLastError, runtime } from '@shared/extension';
import { BackgroundEventArgs, BackgroundEventResult, BackgroundEvents } from '../types/background';
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

/**
 * Sends a message to the background script.
 *
 * @param {keyof BackgroundEvents} event The message type to send.
 * @param {BackgroundEventArgs} args The arguments to pass to the message.
 * @returns {Promise<BackgroundEventResult>} The result of the message.
 */
export const sendToBackground = <TEvent extends keyof BackgroundEvents>(
  event: TEvent,
  ...args: BackgroundEventArgs<TEvent>
): Promise<BackgroundEventResult<TEvent>> => send(event, false, ...args);

/**
 * Sends a message to the background script and ignores its result.
 *
 * @param {keyof BackgroundEvents} event The message type to send.
 * @param {BackgroundEventArgs} args The arguments to pass to the message.
 * @returns {void}
 */
export const fireToBackground = <TEvent extends keyof BackgroundEvents>(
  event: TEvent,
  ...args: BackgroundEventArgs<TEvent>
): void => void sendToBackground(event, ...args);

export const broadcastToBackground = <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  ...args: BroadcastEventArgs<TEvent>
): void => void send(event, true, ...args);
