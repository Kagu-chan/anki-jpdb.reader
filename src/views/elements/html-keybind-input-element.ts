import { Keybind, Keybinds } from '@shared/configuration/types';

const observedAttributes = ['value', 'name'] as const;

type ObservedAttributes = (typeof observedAttributes)[number];

export class HTMLKeybindInputElement extends HTMLElement {
  public static observedAttributes = observedAttributes;

  protected _input: HTMLInputElement;
  protected _buttons: HTMLInputElement[] = [];

  protected static active?: HTMLKeybindInputElement;
  protected static index?: number;

  protected static EVENTS = ['keydown', 'keyup', 'mousedown', 'mouseup'];
  protected static MODIFIERS = ['Control', 'Alt', 'AltGraph', 'Meta', 'Shift'];
  protected static MOUSE_BUTTONS = [
    'Left Mouse Button',
    'Middle Mouse Button',
    'Right Mouse Button',
  ];

  //#region Attributes

  public get value(): Keybinds {
    return JSON.parse(this.getAttribute('value')!) as Keybinds;
  }
  public set value(value: Keybinds) {
    this.setAttribute('value', JSON.stringify(value));
  }

  public get name(): string {
    return this.getAttribute('name')!;
  }
  public set name(value: string) {
    this.setAttribute('name', value);
  }

  protected get arrayValue(): Keybind[] {
    if (Array.isArray(this.value)) {
      return this.value.filter((keybind) => keybind?.code?.length) as Keybind[];
    }

    return this.value?.code?.length ? [this.value] : [];
  }

  //#endregion
  //#region Lifecycle

  public connectedCallback(): void {
    this.buildInput();
    this.buildButtons();
  }

  public attributeChangedCallback(
    name: ObservedAttributes,
    oldValue: unknown,
    newValue: unknown,
  ): void {
    const pascalCaseName = name.replace(/(^\w|-\w)/g, (a) => a.replace(/-/, '').toUpperCase());
    const functionName = `on${pascalCaseName}Changed`;
    const changeHandler = this[functionName as keyof this] as
      | ((oldValue: unknown, newValue: unknown) => void | Promise<void>)
      | undefined;

    if (changeHandler) {
      changeHandler.apply(this, [oldValue, newValue]);
    }
  }

  //#endregion
  //#region Events

  protected onValueChanged(_: string, newValue: string): void {
    if (this._input && this._input.value !== newValue) {
      this._input.value = newValue;

      if (!HTMLKeybindInputElement.active) {
        this.updateButtonValues();
      }

      this.dispatchEvent(new Event('change'));
    }
  }

  //#endregion
  //#region DOM

  protected buildInput(): void {
    this._input = document.createElement('input');
    this._input.type = 'hidden';
    this._input.name = this.name;

    this._input.addEventListener('change', () => {
      this.value = JSON.parse(this._input.value) as Keybinds;

      this.dispatchEvent(new Event('change'));
    });

    this.appendChild(this._input);
  }

  protected buildButtons(): void {
    const buildButton = (index: number): void => {
      const button = document.createElement('input');

      button.type = 'button';
      button.classList.add('outline');

      // We use mousedown instead of click to allow the left mouse button being used as keybind.
      // If we would use click, the event propagation cannot be stopped and the button would activate again immediately after the keybind was chosen.
      button.addEventListener('mousedown', (event) => this.initChooseKey(event, index));

      this._buttons.push(button);
      this.appendChild(button);
    };

    buildButton(0);
    buildButton(1);
  }

  //#endregion
  //#region Helpers

  protected keybindToString(keybind?: Keybind): string {
    const { key = '', code = '', modifiers = '' } = keybind ?? {};

    return !key.length && !code.length ? 'None' : `${key} (${[...modifiers, code].join('+')})`;
  }

  protected updateButtonValues(): void {
    this._buttons.forEach((button, index) => {
      button.value = this.keybindToString(this.arrayValue[index]);
    });
  }

  //#endregion
  //#region Choose Keys

  protected initChooseKey(event: MouseEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();

    // To activate any keybind, we only accept the left mouse button.
    if (event.button !== 0) {
      return;
    }

    // If any keybind input is already active, we check if it's the same as the current one.
    // If it's not, we change the active keybind input to the current one.
    if (HTMLKeybindInputElement.active) {
      if (HTMLKeybindInputElement.active !== this) {
        HTMLKeybindInputElement.active.deactivate();

        return this.activate(event, index);
      }

      return;
    }

    this.activate(event, index);
  }

  protected activate(event: MouseEvent, index: number): void {
    (event.target as HTMLInputElement).value = 'Press a key, escape to cancel';

    HTMLKeybindInputElement.EVENTS.forEach((event) =>
      document.addEventListener(event, HTMLKeybindInputElement.keyListener),
    );

    HTMLKeybindInputElement.active = this;
    HTMLKeybindInputElement.index = index;
  }

  protected deactivate(): void {
    this.updateButtonValues();

    HTMLKeybindInputElement.EVENTS.forEach((event) =>
      document.removeEventListener(event, HTMLKeybindInputElement.keyListener),
    );

    HTMLKeybindInputElement.active = undefined;
    HTMLKeybindInputElement.index = undefined;
  }

  protected static keyListener(this: void, event: KeyboardEvent | MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // We ignore the keydown event for modifiers, and only register them on keyup.
    // This allows pressing and holding modifiers before pressing the main hotkey.
    if (
      event instanceof KeyboardEvent &&
      event.type === 'keydown' &&
      HTMLKeybindInputElement.MODIFIERS.includes(event.key)
    ) {
      return;
    }

    // .code: Layout-independent key identifier (usually equal to whatever that key means in qwerty)
    // .key: Key character in the current layout (respecting modifiers like shift or altgr)
    // .button: Mouse button number
    const code = event instanceof KeyboardEvent ? event.code : `Mouse${event.button}`;
    const key =
      event instanceof KeyboardEvent
        ? event.key
        : (HTMLKeybindInputElement.MOUSE_BUTTONS[event.button] ?? code);
    const modifiers = HTMLKeybindInputElement.MODIFIERS.filter(
      (name) => name !== key && event.getModifierState(name),
    );

    if (!modifiers.length && code === 'Mouse0') {
      // We don't want to allow the left mouse button as keybind, as it would be impossible to click on anything.
      return;
    }

    if (code === 'Mouse2') {
      // We don't want to allow the right mouse button as keybind, as it would interfere with the context menu, which is another event
      return;
    }

    const active = HTMLKeybindInputElement.active!;
    const index = HTMLKeybindInputElement.index!;
    const arrayValue = active.arrayValue;

    const value =
      code === 'Escape'
        ? {
            key: '',
            code: '',
            modifiers: [],
          }
        : { key, code, modifiers };

    arrayValue[index] = value;
    active.value = arrayValue as Keybinds;

    active.deactivate();
  }
  //#endregion
}
