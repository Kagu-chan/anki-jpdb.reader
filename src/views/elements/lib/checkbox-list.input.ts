import { createElement } from '@shared/dom/create-element';
import { findElement } from '@shared/dom/find-element';

const observedAttributes = ['value', 'name'] as const;

type ObservedAttributes = (typeof observedAttributes)[number];

export abstract class CheckboxListInput<
  T extends {
    id: string;
    name: string;
    description: string;
  },
> extends HTMLElement {
  public static observedAttributes = observedAttributes;

  protected abstract allowInspect?: boolean;
  protected abstract invertList?: boolean;
  protected _input: HTMLInputElement;
  protected _checkboxes: Record<string, HTMLInputElement> = {};

  //#region Attributes

  public get value(): string[] {
    return JSON.parse(this.getAttribute('value')!) as string[];
  }
  public set value(value: string[]) {
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
    this.renderList();
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

      this.updateCheckboxes();
      this.dispatchEvent(new Event('change'));
    }
  }

  //#endregion
  //#region DOM

  protected abstract getRows(): T[];

  protected buildInput(): void {
    this._input = document.createElement('input');
    this._input.type = 'hidden';
    this._input.name = this.name;

    this._input.addEventListener('change', () => {
      this.value = JSON.parse(this._input.value) as string[];

      this.dispatchEvent(new Event('change'));
    });

    this.appendChild(this._input);
  }

  protected renderList(): void {
    const items = this.getRows();

    if (items.length === 0) {
      this.innerHTML = '<p>No items available.</p>';

      return;
    }

    if (items.length === 1) {
      this.appendChild(
        createElement('div', {
          class: 'checkbox',
          children: [
            this.createCheckbox(items[0].id),
            {
              tag: 'label',
              attributes: {
                for: items[0].id,
              },
              innerText: items[0].name,
            },
          ],
        }),
      );

      const description = createElement('div', {
        style: { opacity: '0.8' },
        innerText: items[0].description,
      });

      description.setAttribute('indent', '');

      this.appendChild(description);

      return;
    }

    const tableHost = createElement('div', {
      class: 'table-box',
    });

    this.appendChild(tableHost);

    for (const item of items) {
      const row = createElement('div', { class: 'row' });
      const checkboxTD = createElement('div', { class: 'col', style: { marginRight: '1.5em' } });
      const checkbox = this.createCheckbox(item.id);

      checkboxTD.appendChild(checkbox);

      const name = createElement('div', {
        class: 'col',
        style: { width: '210px' },
        children: [
          {
            tag: 'label',
            attributes: {
              for: item.id,
            },
            innerText: item.name,
          },
        ],
      });
      const description = createElement('div', {
        class: 'col',
        children: [
          {
            tag: 'label',
            attributes: {
              for: item.id,
            },
            innerText: item.description,
          },
        ],
      });

      row.appendChild(checkboxTD);
      row.appendChild(name);
      row.appendChild(description);

      if (this.allowInspect) {
        const code = createElement('div', {
          class: 'col',
          style: { width: '20px', textAlign: 'right' },
          children: [
            {
              tag: 'i',
              class: ['fa', 'fa-code'],
              style: { cursor: 'pointer' },
              attributes: {
                ariaHidden: 'true',
              },
              handler: (): void => {
                this.showCodeOverlay(item);
              },
            },
          ],
        });

        row.appendChild(code);
      }

      tableHost.appendChild(row);
    }

    this.updateCheckboxes();
  }

  protected createCheckbox(id: string): HTMLInputElement {
    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';
    checkbox.name = id;
    checkbox.id = id;

    checkbox.setAttribute('internal', 'true');
    checkbox.addEventListener('change', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      if (checkbox.checked) {
        this.enable(id);
      } else {
        this.disable(id);
      }

      this.dispatchEvent(new Event('change'));
    });

    this._checkboxes[id] = checkbox;

    return checkbox;
  }

  protected updateCheckboxes(): void {
    for (const checkbox of Object.values(this._checkboxes)) {
      const inList = (this.value ?? []).includes(checkbox.id);

      checkbox.checked = this.invertList ? !inList : inList;
    }
  }

  protected enable(id: string): void {
    if (this.invertList) {
      this.removeFromList(id);
    } else {
      this.addToList(id);
    }
  }

  protected disable(id: string): void {
    if (this.invertList) {
      this.addToList(id);
    } else {
      this.removeFromList(id);
    }
  }

  protected addToList(id: string): void {
    this.value = [...new Set([...this.value, id])];
  }

  protected removeFromList(id: string): void {
    this.value = this.value.filter((value) => value !== id);
  }

  protected showCodeOverlay(host: T): void {
    const backdrop = createElement('div', {
      class: 'backdrop',
      attributes: {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': host.id,
        'aria-describedby': host.id,
      },
      handler: (): void => {
        this.hideCodeOverlay();
      },
    });

    this.appendChild(backdrop);

    const overlay = createElement('div', {
      class: 'overlay',
      children: [
        {
          tag: 'h3',
          innerText: host.name,
        },
        {
          tag: 'pre',
          innerText: JSON.stringify(host, null, 2),
        },
      ],
    });

    this.appendChild(overlay);
  }

  protected hideCodeOverlay(): void {
    findElement(this, '.backdrop')?.remove();
    findElement(this, '.overlay')?.remove();
  }
}
