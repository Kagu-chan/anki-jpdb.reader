import { getConfiguration } from '@shared/configuration/get-configuration';
import { ConfigurationSchema, Keybind, Keybinds } from '@shared/configuration/types';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';
import { FilterKeys } from '@shared/types';
import { NoFocusTrigger } from './no-focus-trigger';
import { Registry } from './registry';

type KeybindKey = FilterKeys<ConfigurationSchema, Keybinds>;

export class KeybindManager {
  /** Map of configured keybinds */
  private _keyMap: Partial<Record<KeybindKey, Keybind[]>> = {};
  private _sortedKeylist: { val: Keybind; key: KeybindKey }[] = [];

  /** Reference which can be added or removed as event listener */
  private _downListener = this.handleKeydown.bind(this) as (e: KeyboardEvent | MouseEvent) => void;
  private _upListener = this.handleKeyUp.bind(this) as (e: KeyboardEvent | MouseEvent) => void;

  private _keydown?: (e: MouseEvent | KeyboardEvent) => void;
  private _keyup?: (e: MouseEvent | KeyboardEvent) => void;

  constructor(
    private _events: KeybindKey[],
    extraListeners?: Partial<Record<'keydown' | 'keyup', (e: MouseEvent | KeyboardEvent) => void>>,
  ) {
    onBroadcastMessage('configurationUpdated', () => this.buildKeyMap(), true);

    this._keydown = extraListeners?.keydown;
    this._keyup = extraListeners?.keyup;
  }

  public addKeys(keys: KeybindKey[], skipBuild?: false): Promise<void>;
  public addKeys(keys: KeybindKey[], skipBuild: true): void;

  public addKeys(keys: KeybindKey[], skipBuild = false): void | Promise<void> {
    this._events = [...new Set([...this._events, ...keys])];

    if (!skipBuild) {
      return this.buildKeyMap();
    }
  }

  public async removeKeys(keys: KeybindKey[], skipBuild?: false): Promise<void>;
  public removeKeys(keys: KeybindKey[], skipBuild: true): void;

  public removeKeys(keys: KeybindKey[], skipBuild = false): void | Promise<void> {
    this._events = this._events.filter((key) => !keys.includes(key));

    if (!skipBuild) {
      return this.buildKeyMap();
    }
  }

  public activate(): void {
    NoFocusTrigger.get().register(this, this._downListener);

    window.addEventListener('keydown', this._downListener);
    window.addEventListener('mousedown', this._downListener);

    window.addEventListener('keyup', this._upListener);
    window.addEventListener('mouseup', this._upListener);
  }

  public deactivate(): void {
    NoFocusTrigger.get().unregister(this);

    window.removeEventListener('keydown', this._downListener);
    window.removeEventListener('mousedown', this._downListener);

    window.removeEventListener('keyup', this._upListener);
    window.removeEventListener('mouseup', this._upListener);
  }

  private async buildKeyMap(): Promise<void> {
    this._keyMap = {};
    this._sortedKeylist = [];

    for (const key of this._events) {
      const raw = await getConfiguration(key);
      const value = (Array.isArray(raw) ? raw.filter((v) => v?.code) : raw.code ? [raw] : null) as
        | Keybind[]
        | null;

      if (value?.length) {
        this._keyMap[key] = value!;
      }
    }

    // Sort the keybinds by the number of modifiers they have, then by the key code
    // This way we can prioritize keybinds with more modifiers, as they may extend other keybinds (e.g. ALT + KEY should have a lower priority than ALT + SHIFT + KEY)
    this._sortedKeylist = Object.entries(this._keyMap)
      .map(([key, val]: [KeybindKey, Keybind[]]) => val.map((v) => ({ key, val: v })))
      .flat()
      .sort((l, r) => {
        if (l.val.modifiers.length !== r.val.modifiers.length) {
          return r.val.modifiers.length - l.val.modifiers.length;
        }

        return l.val.code.localeCompare(r.val.code);
      });
  }

  private handleKeydown(e: KeyboardEvent | MouseEvent): void {
    const { events } = Registry;

    if (this.shouldCancel()) {
      // Ignore events on input elements! Otherwise we may interfere with typing.
      return;
    }

    events.emit('keydown', e);
    this._keydown?.(e);

    const keybind = this.getActiveKeybind(e);

    if (keybind) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      events.emit(keybind, e);
    }
  }

  private handleKeyUp(e: KeyboardEvent | MouseEvent): void {
    const { events } = Registry;

    if (this.shouldCancel()) {
      // Ignore events on input elements! Otherwise we may interfere with typing.
      return;
    }

    events.emit('keyup', e);
    this._keyup?.(e);

    const keybind = this.getActiveKeybind(e);

    if (keybind) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      events.emit(`${keybind}Released` as KeybindKey, e);
    }
  }

  private shouldCancel(): boolean {
    return ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '');
  }

  private getActiveKeybind(e: KeyboardEvent | MouseEvent): KeybindKey | undefined {
    return this._sortedKeylist.find(({ val }) => this.checkKeybind(val, e))?.key;
  }

  private checkKeybind(keybind: Keybind | undefined, event: KeyboardEvent | MouseEvent): boolean {
    if (!keybind) {
      return false;
    }

    if (event instanceof MouseEvent && event.type === 'mousemove') {
      return this.checkMoveEvent(keybind, event);
    }

    const code = event instanceof KeyboardEvent ? event.code : `Mouse${event.button}`;

    return code === keybind.code && keybind.modifiers.every((name) => event.getModifierState(name));
  }

  private checkMoveEvent(keybind: Keybind, event: MouseEvent): boolean {
    // Map left/right-specific modifiers to their generic names
    const modifierMap: Record<string, string> = {
      ShiftLeft: 'Shift',
      ShiftRight: 'Shift',
      ControlLeft: 'Control',
      ControlRight: 'Control',
      AltLeft: 'Alt',
      AltRight: 'Alt',
    };

    const required = [...keybind.modifiers, modifierMap[keybind.code] ?? keybind.code].filter(
      Boolean,
    );

    return required.length > 0 && required.every((name) => event.getModifierState(name));
  }
}
