import { browser } from './browser';

type Filter<T, TF extends T[keyof T]> = keyof {
  [K in keyof T as T[K] extends TF ? K : never]: T[K];
};

type NumberKeys = Filter<ConfigurationSchema, number>[];
type BooleanKeys = Filter<ConfigurationSchema, boolean>[];
type ObjectKeys = Filter<
  ConfigurationSchema,
  Keybind | DeckConfiguration | DiscoverWordConfiguration[]
>[];

class Configuration {
  private NUMBER_KEYS: NumberKeys = ['schemaVersion', 'contextWidth'];
  private BOOLEAN_KEYS: BooleanKeys = [
    'showPopupOnHover',
    'touchscreenSupport',
    'disableFadeAnimation',
  ];
  private OBJECT_KEYS: ObjectKeys = [
    'showPopupKey',
    'miningConfig',
    'blacklistConfig',
    'neverForgetConfig',
    'readonlyConfigs',
  ];

  public readonly DEFAULTS: ConfigurationSchema = {
    schemaVersion: 1,
    apiToken: '',
    ankiUrl: 'http://localhost:8765',
    ankiProxyUrl: '',
    miningConfig: {
      deck: '',
      model: '',
      proxy: false,
      wordField: '',
      readingField: '',
      templateTargets: [],
    },
    blacklistConfig: {
      deck: '',
      model: '',
      proxy: false,
      wordField: '',
      readingField: '',
      templateTargets: [],
    },
    neverForgetConfig: {
      deck: '',
      model: '',
      proxy: false,
      wordField: '',
      readingField: '',
      templateTargets: [],
    },
    readonlyConfigs: [],
    contextWidth: 1,
    customPopupCSS: '',
    customWordCSS: '',
    showPopupOnHover: true,
    touchscreenSupport: false,
    disableFadeAnimation: false,
    showPopupKey: { key: 'Shift', code: 'ShiftLeft', modifiers: [] },
  };

  public async get<K extends keyof ConfigurationSchema>(
    key: K,
    defaultValue?: ConfigurationSchema[K],
  ): Promise<ConfigurationSchema[K]> {
    const value: string = await browser.readStorage(key, defaultValue?.toString());

    if (this.NUMBER_KEYS.includes(key as Filter<ConfigurationSchema, number>)) {
      return parseInt(value, 10) as ConfigurationSchema[K];
    }

    if (this.BOOLEAN_KEYS.includes(key as Filter<ConfigurationSchema, boolean>)) {
      return (value === 'true') as ConfigurationSchema[K];
    }

    if (this.OBJECT_KEYS.includes(key as Filter<ConfigurationSchema, Keybind>)) {
      try {
        return JSON.parse(value) as ConfigurationSchema[K];
      } catch {
        // Catch broken persisted values and return the default value
        return defaultValue as ConfigurationSchema[K];
      }
    }

    return value as ConfigurationSchema[K];
  }

  public async set<K extends keyof ConfigurationSchema>(
    key: K,
    value: ConfigurationSchema[K],
  ): Promise<void> {
    await browser.writeStorage(
      key,
      typeof value === 'object' ? JSON.stringify(value) : value.toString(),
    );
  }
}

export const configuration = new Configuration();
