import { getLastError, getTabs, runtime, tabs } from '../../extension';
import { Command } from '../lib/command';

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
    isBroadcast: true;
    args: TArguments;
  } {
    return {
      event: this.key,
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
