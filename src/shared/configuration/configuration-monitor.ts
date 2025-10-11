import { parseConfiguration } from './parse-configuration';
import { ConfigurationSchema } from './types';

const map = new Map<string, ConfigurationMonitor<keyof ConfigurationSchema>>();

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

const collectAndCall = <T extends keyof ConfigurationSchema>(
  monitor: ConfigurationMonitor<T>,
  done?: (self: ConfigurationMonitor<T>) => void,
): void => {
  chrome.storage.local.get(monitor.keys, (items) => {
    const result: Pick<ConfigurationSchema, T> = {} as Pick<ConfigurationSchema, T>;

    for (const key of monitor.keys) {
      result[key] = parseConfiguration(key, items[key] as string);
    }

    (monitor as { values: Pick<ConfigurationSchema, T> }).values = result;

    const afterFn = monitor.callback(result);

    if (!afterFn) {
      return done?.(monitor);
    }

    void afterFn.then(() => done?.(monitor));
  });
};

export class ConfigurationMonitor<T extends keyof ConfigurationSchema> {
  public readonly values: Pick<ConfigurationSchema, T> | null = null;

  private id: string = crypto.randomUUID();

  constructor(
    public readonly keys: T[],
    public readonly callback: (value: Pick<ConfigurationSchema, T>) => void | Promise<void>,
    done?: (self: ConfigurationMonitor<T>) => void,
  ) {
    map.set(this.id, this as unknown as ConfigurationMonitor<keyof ConfigurationSchema>);

    collectAndCall(this, done);
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
    resolve?: false,
  ): ConfigurationMonitor<T>;

  public static watch<T extends keyof ConfigurationSchema>(
    keys: T[],
    callback: (value: Pick<ConfigurationSchema, T>) => void | Promise<void>,
    resolve: true,
  ): Promise<ConfigurationMonitor<T>>;

  public static watch<T extends keyof ConfigurationSchema>(
    keys: T[],
    callback: (value: Pick<ConfigurationSchema, T>) => void | Promise<void>,
    resolve?: boolean,
  ): ConfigurationMonitor<T> | Promise<ConfigurationMonitor<T>> {
    if (!resolve) {
      return new ConfigurationMonitor(keys, callback);
    }

    return new Promise<ConfigurationMonitor<T>>((res) => {
      new ConfigurationMonitor(keys, callback, (self) => res(self));
    });
  }
}
