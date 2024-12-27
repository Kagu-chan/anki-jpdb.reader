import { getConfiguration, ConfigurationSchema, Keybind } from '@shared/configuration';
import { onBroadcastMessage } from '@shared/messages';
import { FilterKeys } from '@shared/types';
import { IntegrationScript } from './integration-script';

export class KeybindManager extends IntegrationScript {
  /** Map of configured keybinds */
  private _keyMap: Partial<Record<FilterKeys<ConfigurationSchema, Keybind>, Keybind>> = {};
  /** Reference which can be added or removed as event listener */
  private _downListener = this.handleKeydown.bind(this) as (e: KeyboardEvent | MouseEvent) => void;
  private _upListener = this.handleKeyUp.bind(this) as (e: KeyboardEvent | MouseEvent) => void;

  private _keydown?: (e: MouseEvent | KeyboardEvent) => void;
  private _keyup?: (e: MouseEvent | KeyboardEvent) => void;

  constructor(
    private _events: FilterKeys<ConfigurationSchema, Keybind>[],
    extraListeners?: Partial<Record<'keydown' | 'keyup', (e: MouseEvent | KeyboardEvent) => void>>,
  ) {
    super();

    onBroadcastMessage('configurationUpdated', () => this.buildKeyMap(), true);

    this._keydown = extraListeners?.keydown;
    this._keyup = extraListeners?.keyup;
  }

  public addKeys(
    keys: FilterKeys<ConfigurationSchema, Keybind>[],
    skipBuild?: false,
  ): Promise<void>;
  public addKeys(keys: FilterKeys<ConfigurationSchema, Keybind>[], skipBuild: true): void;

  public addKeys(
    keys: FilterKeys<ConfigurationSchema, Keybind>[],
    skipBuild = false,
  ): void | Promise<void> {
    this._events = [...new Set([...this._events, ...keys])];

    if (!skipBuild) {
      return this.buildKeyMap();
    }
  }

  public async removeKeys(
    keys: FilterKeys<ConfigurationSchema, Keybind>[],
    skipBuild?: false,
  ): Promise<void>;
  public removeKeys(keys: FilterKeys<ConfigurationSchema, Keybind>[], skipBuild: true): void;

  public removeKeys(
    keys: FilterKeys<ConfigurationSchema, Keybind>[],
    skipBuild = false,
  ): void | Promise<void> {
    this._events = this._events.filter((key) => !keys.includes(key));

    if (!skipBuild) {
      return this.buildKeyMap();
    }
  }

  public activate(): void {
    window.addEventListener('keydown', this._downListener);
    window.addEventListener('mousedown', this._downListener);

    window.addEventListener('keyup', this._upListener);
    window.addEventListener('mouseup', this._upListener);
  }

  public deactivate(): void {
    window.removeEventListener('keydown', this._downListener);
    window.removeEventListener('mousedown', this._downListener);

    window.removeEventListener('keyup', this._upListener);
    window.removeEventListener('mouseup', this._upListener);
  }

  public isKeybind(
    key: FilterKeys<ConfigurationSchema, Keybind>,
    event: KeyboardEvent | MouseEvent,
  ): boolean;
  public isKeybind(key: Keybind, event: KeyboardEvent | MouseEvent): boolean;

  public isKeybind(
    key: FilterKeys<ConfigurationSchema, Keybind> | Keybind,
    event: KeyboardEvent | MouseEvent,
  ): boolean {
    return this.checkKeybind(typeof key === 'string' ? this._keyMap[key] : key, event);
  }

  private async buildKeyMap(): Promise<void> {
    this._keyMap = {};

    for (const key of this._events) {
      const value = await getConfiguration(key, true);

      if (value.code) {
        this._keyMap[key] = value;
      }
    }
  }

  private handleKeydown(e: KeyboardEvent | MouseEvent): void {
    if (this.shouldCancel()) {
      // Ignore events on input elements! Otherwise we may interfere with typing.
      return;
    }

    this.emit('keydown', e);
    this._keydown?.(e);

    const keybind = this.getActiveKeybind(e);

    if (keybind) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      this.emit(keybind, e);
    }
  }

  private handleKeyUp(e: KeyboardEvent | MouseEvent): void {
    if (this.shouldCancel()) {
      // Ignore events on input elements! Otherwise we may interfere with typing.
      return;
    }

    this.emit('keyup', e);
    this._keyup?.(e);

    const keybind = this.getActiveKeybind(e);

    if (keybind) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      this.emit(`${keybind}Released` as FilterKeys<ConfigurationSchema, Keybind>, e);
    }
  }

  private shouldCancel(): boolean {
    return ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '');
  }

  private getActiveKeybind(
    e: KeyboardEvent | MouseEvent,
  ): FilterKeys<ConfigurationSchema, Keybind> | undefined {
    // Sort the keybinds by the number of modifiers they have, then by the key code
    // This way we can prioritize keybinds with more modifiers, as they may extend other keybinds (e.g. ALT + KEY should have a lower priority than ALT + SHIFT + KEY)
    const sorted = Object.entries(this._keyMap)
      .sort(([, lBind], [, rBind]) => {
        if (lBind.modifiers.length !== rBind.modifiers.length) {
          return rBind.modifiers.length - lBind.modifiers.length;
        }

        return lBind.code.localeCompare(rBind.code);
      })
      .map(([key]) => key) as FilterKeys<ConfigurationSchema, Keybind>[];

    return sorted.find((keybind) => this.checkKeybind(this._keyMap[keybind], e));
  }

  private checkKeybind(keybind: Keybind | undefined, event: KeyboardEvent | MouseEvent): boolean {
    if (!keybind) {
      return false;
    }

    const code = event instanceof KeyboardEvent ? event.code : `Mouse${event.button}`;

    return code === keybind.code && keybind.modifiers.every((name) => event.getModifierState(name));
  }
}
