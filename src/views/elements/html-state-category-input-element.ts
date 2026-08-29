import { ConfigurationMonitor } from '@shared/configuration/configuration-monitor';
import { BaseStylingMode, ConfigurationSchema } from '@shared/configuration/types';
import { createElement } from '@shared/dom/create-element';
import {
  JPDBCardState,
  LabeledCardState,
  StateCategories,
  WordStateCategory,
} from '@shared/jpdb/types';
import { toColorString } from '@shared/style-presets/color';

const observedAttributes = ['value', 'name'] as const;

type ObservedAttributes = (typeof observedAttributes)[number];

const CATEGORY_OPTIONS: { value: WordStateCategory | ''; label: string }[] = [
  { value: '', label: 'None' },
  { value: WordStateCategory.NEW, label: 'New' },
  { value: WordStateCategory.LEARNING, label: 'Learning' },
  { value: WordStateCategory.KNOWN, label: 'Known' },
];

const WATCHED_KEYS = [
  'enableStylePresets',
  'baseStylingMode',
  'jpdbColorNew',
  'jpdbColorLearning',
  'jpdbColorKnown',
  'categoryColorNew',
  'categoryColorLearning',
  'categoryColorKnown',
] as const satisfies readonly (keyof ConfigurationSchema)[];

type WatchedConfig = Pick<ConfigurationSchema, (typeof WATCHED_KEYS)[number]>;

const JPDB_CATEGORY_COLOR_KEYS: Record<WordStateCategory, keyof WatchedConfig> = {
  [WordStateCategory.NEW]: 'jpdbColorNew',
  [WordStateCategory.LEARNING]: 'jpdbColorLearning',
  [WordStateCategory.KNOWN]: 'jpdbColorKnown',
};

const CATEGORY_COLOR_KEYS: Record<WordStateCategory, keyof WatchedConfig> = {
  [WordStateCategory.NEW]: 'categoryColorNew',
  [WordStateCategory.LEARNING]: 'categoryColorLearning',
  [WordStateCategory.KNOWN]: 'categoryColorKnown',
};

const LABELED_CARD_STATES: LabeledCardState[] = [
  {
    id: JPDBCardState.NOT_IN_DECK,
    name: 'Not in Deck',
    description: 'The card is not currently in any deck.',
  },
  {
    id: JPDBCardState.NEW,
    name: 'New',
    description: "Card is in one of your decks and you've never reviewed it.",
  },
  {
    id: JPDBCardState.LEARNING,
    name: 'Learning',
    description:
      'Card was positively reviewed and is waiting until its review interval lapses; its level is not yet high enough to be treated as known.',
  },
  {
    id: JPDBCardState.KNOWN,
    name: 'Known',
    description:
      'Card was positively reviewed and is waiting until its review interval lapses; its level is high enough to be treated as known.',
  },
  {
    id: JPDBCardState.DUE,
    name: 'Due',
    description:
      "Card was positively reviewed but its review interval has already lapsed so it's ready for another review.",
  },
  {
    id: JPDBCardState.FAILED,
    name: 'Failed',
    description:
      "Card was negatively reviewed and it's either waiting or ready for another review.",
  },
  {
    id: JPDBCardState.LOCKED,
    name: 'Locked',
    description:
      "One of card's dependencies is not fulfilled, or one of its dependencies was just reviewed.",
  },
  {
    id: JPDBCardState.NEVER_FORGET,
    name: 'Never forget',
    description: 'Card is permanently treated as known and will never appear in your reviews.',
  },
  {
    id: JPDBCardState.SUSPENDED,
    name: 'Suspended',
    description: 'Card will never appear in your reviews and will be treated as not known.',
  },
  {
    id: JPDBCardState.BLACKLISTED,
    name: 'Blacklisted',
    description:
      'Card will never appear in your reviews and will be treated just as if it has never existed in the first place.',
  },
  {
    id: JPDBCardState.REDUNDANT,
    name: 'Redundant',
    description:
      'Card is a variant of another card; it will never appear in your reviews, and its state will be derived from the variant to which it is submissive to.',
  },
];

export class HTMLStateCategoryInputElement extends HTMLElement {
  public static observedAttributes = observedAttributes;

  private _input: HTMLInputElement;
  private _selects: Record<string, HTMLSelectElement> = {};
  private _colorMonitor?: ConfigurationMonitor<(typeof WATCHED_KEYS)[number]>;
  private _colorConfig: WatchedConfig | null = null;

  //#region Attributes

  public get value(): StateCategories {
    return JSON.parse(this.getAttribute('value')!) as StateCategories;
  }
  public set value(value: StateCategories) {
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

    this._colorMonitor = ConfigurationMonitor.watch(WATCHED_KEYS, (config) => {
      this._colorConfig = config;

      this.updateSelects();
    });
  }

  public disconnectedCallback(): void {
    this._colorMonitor?.disconnect();
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

      this.updateSelects();
      this.dispatchEvent(new Event('change'));
    }
  }

  //#endregion
  //#region DOM

  private buildInput(): void {
    this._input = document.createElement('input');
    this._input.type = 'hidden';
    this._input.name = this.name;

    this._input.addEventListener('change', () => {
      this.value = JSON.parse(this._input.value) as StateCategories;

      this.dispatchEvent(new Event('change'));
    });

    this.appendChild(this._input);
  }

  private renderList(): void {
    const tableHost = createElement('div', { class: 'table-box' });

    this.appendChild(tableHost);

    for (const state of LABELED_CARD_STATES) {
      const row = createElement('div', { class: 'row' });
      const selectTD = createElement('div', {
        class: 'col',
        style: { width: '130px', marginRight: '1.5em' },
      });
      const select = this.createSelect(state);

      selectTD.appendChild(select);

      const name = createElement('div', {
        class: 'col',
        style: { width: '130px' },
        children: [
          {
            tag: 'label',
            attributes: {
              for: state.id,
            },
            innerText: state.name,
          },
        ],
      });
      const description = createElement('div', {
        class: 'col',
        children: [
          {
            tag: 'label',
            attributes: {
              for: state.id,
            },
            innerText: state.description,
          },
        ],
      });

      row.appendChild(name);
      row.appendChild(selectTD);
      row.appendChild(description);

      tableHost.appendChild(row);
    }

    this.updateSelects();
  }

  private createSelect({ id }: LabeledCardState): HTMLElement {
    const select = createElement('select', {
      id,
      attributes: { internal: 'true' },
      children: CATEGORY_OPTIONS.map((option) => ({
        tag: 'option',
        attributes: { value: option.value },
        innerText: option.label,
      })),
    });

    select.name = id;
    select.addEventListener('change', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      this.setCategory(id, select.value as WordStateCategory);
    });

    this._selects[id] = select;

    return select;
  }

  private updateSelects(): void {
    for (const select of Object.values(this._selects)) {
      const category = this.value?.[select.id as JPDBCardState];

      select.value = category ?? '';
      select.style.borderColor = this.resolveBorderColor(category);
    }
  }

  private resolveBorderColor(category: WordStateCategory | undefined): string {
    if (!this._colorConfig?.enableStylePresets || !category) {
      return '';
    }

    if (this._colorConfig.baseStylingMode === BaseStylingMode.JPDB) {
      return toColorString(this._colorConfig[JPDB_CATEGORY_COLOR_KEYS[category]]);
    }

    if (this._colorConfig.baseStylingMode === BaseStylingMode.CATEGORY) {
      return toColorString(this._colorConfig[CATEGORY_COLOR_KEYS[category]]);
    }

    return '';
  }

  private setCategory(state: JPDBCardState, category: WordStateCategory | undefined): void {
    const next = { ...this.value };

    if (category) {
      next[state] = category;
    } else {
      delete next[state];
    }

    this.value = next;
  }

  //#endregion
}
