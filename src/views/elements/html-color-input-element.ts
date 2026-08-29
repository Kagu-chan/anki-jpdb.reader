import { PresetColor } from '@shared/configuration/types';

const observedAttributes = ['value', 'name'] as const;

type ObservedAttributes = (typeof observedAttributes)[number];

/**
 * Stopgap element until a real color-picker UI is built - for now it just exposes the raw
 * PresetColor object as JSON text, while still behaving like the other custom form elements
 * (value/name attributes, dispatching `change`) so the settings page needs no special-casing.
 */
export class HTMLColorInputElement extends HTMLElement {
  public static observedAttributes = observedAttributes;

  private _input: HTMLInputElement;

  //#region Attributes

  public get value(): PresetColor {
    return JSON.parse(this.getAttribute('value')!) as PresetColor;
  }
  public set value(value: PresetColor) {
    this.setAttribute('value', JSON.stringify(value));
  }

  public get name(): string {
    return this.getAttribute('name')!;
  }
  public set name(value: string) {
    this.setAttribute('name', value);
  }

  //#endregion
  //#region Lifecycle

  public connectedCallback(): void {
    this.buildInput();
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

      this.dispatchEvent(new Event('change'));
    }
  }

  protected onNameChanged(_: string, newValue: string): void {
    if (this._input) {
      this._input.name = newValue;
    }
  }

  //#endregion
  //#region DOM

  private buildInput(): void {
    this._input = document.createElement('input');
    this._input.type = 'text';
    this._input.name = this.name;
    this._input.value = this.getAttribute('value') ?? '';

    this._input.addEventListener('change', () => {
      try {
        this.value = JSON.parse(this._input.value) as PresetColor;
      } catch {
        this._input.value = this.getAttribute('value') ?? '';
      }
    });

    this.appendChild(this._input);
  }

  //#endregion
}
