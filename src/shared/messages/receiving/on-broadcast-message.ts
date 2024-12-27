import { runtime } from '@shared/extension';
import { BroadcastEventArgs, BroadcastEventFunction, BroadcastEvents } from '../types/broadcast';
import { ExtensionMessage } from '../types/extension-message';

/**
 * Message handler to receive broadcasted messages.
 */
export const onBroadcastMessage = <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  handler: BroadcastEventFunction<TEvent>,
  runNow: BroadcastEventArgs<TEvent> extends [] ? boolean : false = false,
): void => {
  runtime.onMessage.addListener((message: ExtensionMessage<BroadcastEvents, TEvent>): void => {
    if (message.event !== event) {
      return;
    }

    void handler(...(message.args as BroadcastEventArgs<TEvent>));
  });

  if (runNow) {
    (handler as () => void)();
  }
};
