import { parseConfiguration } from './parse-configuration';
import { ConfigurationSchema } from './types';

const map = new Map<string, ConfigurationMonitor<never>>();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') {
    return;
  }

  const monitors = Array.from(map.values());

  if (monitors.length === 0) {
    return;
  }

  const callSet = new Set<ConfigurationMonitor<never>>();

  Object.keys(changes).forEach((key) => {
    monitors
      .filter((m) => m.respondTo(key))
      .forEach((m) => callSet.add(m as unknown as ConfigurationMonitor<never>));
  });

  callSet.forEach((m) => {
    collectAndCall(m);
  });
});

const collectAndCall = (monitor: ConfigurationMonitor<never>): void => {
  chrome.storage.local.get(monitor.keys, (items) => {
    const result: Record<string, unknown> = {};

    for (const key of monitor.keys) {
      if (key in items) {
        result[key] = parseConfiguration(key, items[key] as string);
      }
    }

    void monitor.callback(result);
  });
};

export class ConfigurationMonitor<T extends keyof ConfigurationSchema> {
  private id: string = crypto.randomUUID();

  constructor(
    public readonly keys: T[],
    public readonly callback: (value: Pick<ConfigurationSchema, T>) => void | Promise<void>,
  ) {
    const self = this as unknown as ConfigurationMonitor<never>;

    map.set(this.id, self);

    collectAndCall(self);
  }

  public disconnect(): void {
    map.delete(this.id);
  }

  public respondTo(key: string): boolean {
    return this.keys.includes(key as T);
  }

  public static watch<T extends keyof ConfigurationSchema>(
    keys: T[],
    callback: (value: Pick<ConfigurationSchema, T>) => void | Promise<void>,
  ): ConfigurationMonitor<T> {
    return new ConfigurationMonitor(keys, callback);
  }
}
