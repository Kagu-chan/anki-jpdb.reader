import { getLastError } from '../../extension/get-last-error';
import { getTabs } from '../../extension/get-tabs';
import { runtime } from '../../extension/runtime';
import { tabs } from '../../extension/tabs';
import { Command } from './command';

export abstract class BroadcastCommand<
  TArguments extends unknown[] = [],
> extends Command<TArguments> {
  public send(): void {
    this.toBackground();

    void getTabs({}).then((tabs) =>
      tabs.forEach((tab) => {
        if (tab.id) {
          this.toForeground(tab.id);
        }
      }),
    );
  }

  protected getArguments(): {
    event: string;
    command: string;
    isBroadcast: true;
    args: TArguments;
  } {
    return {
      event: this.key,
      command: this.constructor.name,
      isBroadcast: true,
      args: this.arguments,
    };
  }

  protected supressError(this: void): true {
    // Fetch the last error to suppress it.
    getLastError();

    return true;
  }

  protected toForeground(tabId: number): void {
    tabs.sendMessage(tabId, this.getArguments(), this.supressError);
  }

  protected toBackground(): void {
    runtime.sendMessage(this.getArguments(), this.supressError);
  }
}
