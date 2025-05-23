import { getConfiguration } from '@shared/configuration/get-configuration';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';
import { KeybindManager } from './keybind-manager';

export class NoFocusTrigger {
  private _touchscreenSupport = false;
  private _activeKeybindManagers = new Map<KeybindManager, (e: MouseEvent) => void>();

  private static _instance: NoFocusTrigger | null = null;
  public static get(): NoFocusTrigger {
    if (!this._instance) {
      this._instance = new NoFocusTrigger();
    }

    return this._instance;
  }

  public install(): void {
    const onMouseMove = (e: MouseEvent): void => this.onMouseMove(e);

    this.installEvents(onMouseMove);
  }

  public register(keybindManager: KeybindManager, e: (e: MouseEvent) => void): void {
    this._activeKeybindManagers.set(keybindManager, e);
  }

  public unregister(keybindManager: KeybindManager): void {
    this._activeKeybindManagers.delete(keybindManager);
  }

  private installEvents(handler: (e: MouseEvent) => void): void {
    let hasEvent = false;

    // When leaving focus, we install the mouse event listener, except if touchscreen support is enabled
    window.addEventListener('blur', () => {
      if (this._touchscreenSupport) {
        return;
      }

      document.addEventListener('mousemove', handler);
      hasEvent = true;
    });

    // When entering focus, we remove the mouse event listener, no matter what
    window.addEventListener('focus', () => {
      document.removeEventListener('mousemove', handler);
      hasEvent = false;
    });

    // We monitor touchscreen support. When it changes, we check and may install the mouse event listener
    onBroadcastMessage(
      'configurationUpdated',
      async () => {
        this._touchscreenSupport = await getConfiguration('touchscreenSupport', true);

        if (this._touchscreenSupport) {
          document.removeEventListener('mousemove', handler);
          hasEvent = false;

          return;
        }

        if (hasEvent || document.hasFocus()) {
          return;
        }

        document.addEventListener('mousemove', handler);
        hasEvent = true;
      },
      true,
    );
  }

  private onMouseMove(e: MouseEvent): void {
    if (document.hasFocus()) {
      // although this should not happen, we wanna play it safe
      return;
    }

    const currentModifierStates = [
      e.getModifierState('Control'),
      e.getModifierState('Shift'),
      e.getModifierState('Alt'),
    ];

    if (currentModifierStates.includes(true)) {
      for (const handler of this._activeKeybindManagers.values()) {
        handler(e);
      }
    }
  }
}
