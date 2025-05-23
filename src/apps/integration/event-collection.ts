import { LocalEventArgs, LocalEventFunction, LocalEvents } from '@shared/messages/types/local';

export class EventCollection {
  private _map = new Map<keyof LocalEvents, Set<LocalEventFunction>>();

  public on<TEvent extends keyof LocalEvents>(
    event: TEvent,
    listener: LocalEventFunction<TEvent>,
  ): void {
    const listeners = this._map.get(event) ?? new Set();

    listeners.add(listener);

    this._map.set(event, listeners);
  }

  public emit<TEvent extends keyof LocalEvents>(
    event: TEvent,
    ...args: LocalEventArgs<TEvent>
  ): void {
    const listeners = this._map.get(event);

    if (!listeners?.size) {
      return;
    }

    for (const listener of listeners) {
      // @ts-expect-error: 2554
      void listener(...args);
    }
  }
}
