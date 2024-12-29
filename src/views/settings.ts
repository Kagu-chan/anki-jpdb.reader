import { getApiVersion } from '@shared/anki';
import {
  getConfiguration,
  setConfiguration,
  ConfigurationSchema,
  Keybind,
} from '@shared/configuration';
import {
  createElement,
  displayToast,
  findElement,
  findElements,
  withElement,
  withElements,
} from '@shared/dom';
import { listUserDecks, ping, JPDBDeck } from '@shared/jpdb';
import { broadcast } from '@shared/messages';
import { HTMLKeybindInputElement } from './elements/html-keybind-input-element';
import { HTMLMiningInputElement } from './elements/html-mining-input-element';

class SettingsController {
  private _lastSavedConfiguration = new Map<
    keyof ConfigurationSchema,
    ConfigurationSchema[keyof ConfigurationSchema]
  >();
  private _currentConfiguration = new Map<
    keyof ConfigurationSchema,
    ConfigurationSchema[keyof ConfigurationSchema]
  >();
  private _localChanges = new Set<keyof ConfigurationSchema>();
  private _invalidFields = new Set<keyof ConfigurationSchema>();

  private _saveButton = findElement<'button'>('#save-all-settings');

  /**
   * FOR DEBUGGING PURPOSES ONLY!
   */
  private _ENABLE_ANKI = false;

  constructor() {
    customElements.define('mining-input', HTMLMiningInputElement);
    customElements.define('keybind-input', HTMLKeybindInputElement);

    void this.setup();
  }

  private async setup(): Promise<void> {
    await this._setupSimpleFields();

    await this._setupJPDB();
    await this._setupAnki();

    await this._setupApiFields();

    this._setupSaveButton();
    this._setupCollapsibleTriggers();
  }

  /**
   * Load the configuration from the storage and populate the settings page with the values.
   * Also, install listeners to keep track of the local changes.
   */
  private async _setupSimpleFields(): Promise<void> {
    await this._setupFields('input, textarea, keybind-input', [''], (type) =>
      type === 'checkbox' ? 'checked' : 'value',
    );
  }

  /**
   * Setup the fields that are dependent on the JPDB or Anki API.
   *
   * They require the API fields to be set up first as well as the API to be tested.
   */
  private async _setupApiFields(): Promise<void> {
    await this._setupFields('select[type=jpdb], mining-input');
  }

  private async _setupFields(
    selector: string,
    filter: string[] = [],
    getTargetProperty: (type: string) => keyof HTMLInputElement = (): keyof HTMLInputElement =>
      'value',
  ): Promise<void> {
    await Promise.all(
      withElements(selector, async (inputElement: HTMLInputElement) => {
        const name = inputElement.name as keyof ConfigurationSchema;

        if (filter.includes(name) || inputElement.type === 'hidden') {
          return;
        }

        const targetProperty: keyof HTMLInputElement = getTargetProperty(inputElement.type);
        const value = this._lastSavedConfiguration
          .set(name, await getConfiguration(name, true))
          .get(name) as Exclude<ConfigurationSchema[keyof ConfigurationSchema], Keybind>;

        this._currentConfiguration.set(name, value);

        (inputElement[targetProperty] as ConfigurationSchema[keyof ConfigurationSchema]) = value;

        // We keep track of the local changes. We enable the save button if there are local changes.
        inputElement.addEventListener('change', () => {
          const lastSaved = this._lastSavedConfiguration.get(name);
          const current = inputElement[targetProperty] as Exclude<
            ConfigurationSchema[keyof ConfigurationSchema],
            Keybind
          >;

          if (lastSaved === current) {
            this._localChanges.delete(name);
          } else {
            this._localChanges.add(name);
          }

          this._currentConfiguration.set(name, current);

          this._updateSaveButton();
        });
      }),
    );
  }

  /**
   * Setup the save button. When clicked, it will save the local changes to the storage.
   */
  private _setupSaveButton(): void {
    this._saveButton.onclick = async (event: Event): Promise<void> => {
      event.stopPropagation();
      event.preventDefault();

      // We only save the fields that are not invalid.
      // The save button would not activate if there are invalid fields except for the ankiProxyUrl.
      const itemsToSave = Array.from(this._localChanges).filter(
        (key) => !this._invalidFields.has(key),
      );

      if (itemsToSave.length === 0) {
        return;
      }

      this._saveButton.disabled = true;

      for (const key of itemsToSave) {
        const inputElement = findElement<'input'>(`[name="${key}"]`);
        const value = inputElement.type === 'checkbox' ? inputElement.checked : inputElement.value;

        await setConfiguration(key, value);

        this._lastSavedConfiguration.set(key, value);
        this._localChanges.delete(key);
      }

      displayToast('success', 'Settings saved successfully');

      broadcast('configurationUpdated');
    };
  }

  private _updateSaveButton(): void {
    // Invalid fields are not considered changed fields.
    const localChanges = Array.from(this._localChanges).filter(
      (key) => !this._invalidFields.has(key),
    );
    // We allow the ankiProxyUrl to be invalid, otherwise one would have to start the proxy every time the settings are opened.
    const invalidFields = Array.from(this._invalidFields).filter((key) => key !== 'ankiProxyUrl');

    this._saveButton.disabled = localChanges.length === 0 || invalidFields.length > 0;
  }

  //#region JPDB

  private async _setupJPDB(): Promise<void> {
    this._setupJPDBInteraction();

    await this._testJPDB();
  }

  private _setupJPDBInteraction(): void {
    this._setupInteraction(
      'input[name="jpdbApiToken"]',
      '#apiTokenButton',
      (): Promise<void> => this._testJPDB(),
    );
  }

  private async _testJPDB(): Promise<void> {
    await this._testEndpoint(
      '#apiTokenButton',
      '[name="jpdbApiToken"]',
      (apiToken) => ping({ apiToken }),
      false,
      async (apiToken: string): Promise<void> => {
        const decks = await listUserDecks(['id', 'name', 'is_built_in'], { apiToken });
        const usableDecks = decks.filter((deck) => !deck.is_built_in);

        this.setJpdbDecks(usableDecks);
      },
      () => this.setJpdbDecks([]),
    );
  }

  private setJpdbDecks(decks: JPDBDeck[]): void {
    decks.unshift(
      { id: '', name: '[None]' },
      { id: 'blacklist', name: '[blacklist]' },
      { id: 'never-forget', name: '[never-forget]' },
      { id: 'forq', name: '[forq]' },
    );

    withElements('select[type=jpdb]', (element: HTMLSelectElement) => {
      element.replaceChildren(
        ...decks.map((deck) =>
          createElement('option', {
            innerText: deck.name,
            attributes: { value: deck.id!.toString() },
          }),
        ),
      );
    });
  }

  //#endregion
  //#region Anki

  private async _setupAnki(): Promise<void> {
    if (!this._ENABLE_ANKI) {
      // !DEBUG ONLY - Remove this condition when the feature is ready for everyone
      return;
    }
    document.getElementById('DEBUG_ANKI')!.style.display = '';

    this._setupAnkiInteraction();

    await this._testAnki();
    await this._testAnkiProxy();
  }

  private _setupAnkiInteraction(): void {
    this._setupInteraction(
      'input[name="ankiUrl"]',
      '#ankiUrlButton',
      (): Promise<void> => this._testAnki(),
    );
    this._setupInteraction(
      'input[name="ankiProxyUrl"]',
      '#ankiProxyUrlButton',
      (): Promise<void> => this._testAnkiProxy(),
    );
  }

  private async _testAnki(): Promise<void> {
    await this._testEndpoint(
      '#ankiUrlButton',
      '[name="ankiUrl"]',
      (ankiConnectUrl) => getApiVersion({ ankiConnectUrl }),
      false,
      (ankiConnectUrl: string): void => {
        withElements('mining-input', (element: HTMLMiningInputElement) => {
          element.fetchUrl = ankiConnectUrl;
        });

        this._animateMiningSection(true);
      },
      () => this._animateMiningSection(false),
    );
  }

  private async _testAnkiProxy(): Promise<void> {
    await this._testEndpoint(
      '#ankiProxyUrlButton',
      '[name="ankiProxyUrl"]',
      (ankiConnectUrl) => getApiVersion({ ankiConnectUrl }),
      true,
    );
  }

  //#endregion
  //#region Interaction Helpers

  private _setupInteraction(
    inputSelector: string,
    buttonSelector: string,
    testFunction: () => void | Promise<void>,
  ): void {
    withElement(inputSelector, (inputElement: HTMLInputElement) => {
      inputElement.addEventListener('change', (): void => void testFunction());
    });

    withElement(buttonSelector, (buttonElement: HTMLButtonElement) => {
      buttonElement.addEventListener('click', (): void => void testFunction());
    });
  }

  private async _testEndpoint<T>(
    buttonSelector: string,
    inputSelector: string,
    testFunction: (value: string) => Promise<T>,
    allowEmpty: boolean,
    afterSuccess?: (value: string) => void | Promise<void>,
    afterFail?: () => void,
  ): Promise<void> {
    const button = findElement<'button'>(buttonSelector);
    const input = findElement<'input'>(inputSelector);

    if (allowEmpty && !input.value) {
      button.classList.remove('v1');
      input.classList.remove('v1');

      this._invalidFields.delete(input.name as keyof ConfigurationSchema);

      this._updateSaveButton();

      return;
    }

    try {
      await testFunction(input.value);

      button.classList.remove('v1');
      input.classList.remove('v1');

      this._invalidFields.delete(input.name as keyof ConfigurationSchema);

      await afterSuccess?.(input.value);
    } catch (_error) {
      button.classList.add('v1');
      input.classList.add('v1');

      this._invalidFields.add(input.name as keyof ConfigurationSchema);

      afterFail?.();
    }

    this._updateSaveButton();
  }

  private _animateMiningSection(show: boolean): void {
    const miningElement = findElement<'div'>('#requires-anki');

    if (show) {
      miningElement.removeAttribute('hidden');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- We need to trigger a reflow
      miningElement.offsetHeight;

      miningElement.classList.add('is-open');

      setTimeout(() => {
        miningElement.classList.add('rem-height');
      }, 300);
    } else {
      miningElement.classList.remove('rem-height');

      setTimeout(() => {
        miningElement.classList.remove('is-open');

        setTimeout(() => {
          miningElement.setAttribute('hidden', '');
        }, 300);
      }, 50);
    }
  }

  //#endregion
  //#region Collapsible and Hideable

  private _collapsible(this: void, collapsible: HTMLElement, show: boolean): void {
    const targetHeight = Number(collapsible.getAttribute('data-height') ?? 1000);
    const skipAnimation = collapsible.hasAttribute('skip-animation');

    if (skipAnimation) {
      if (show) {
        collapsible.removeAttribute('hidden');
        collapsible.style.maxHeight = 'unset';

        return;
      }

      collapsible.setAttribute('hidden', '');
      collapsible.style.maxHeight = '0';

      return;
    }

    if (show) {
      collapsible.removeAttribute('hidden');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- We need to trigger a reflow
      collapsible.offsetHeight;

      collapsible.classList.add('is-open');
      collapsible.style.maxHeight = `${targetHeight}px`;

      setTimeout(() => {
        collapsible.classList.add('rem-height');
        collapsible.style.maxHeight = 'unset';
      }, 300);
    } else {
      collapsible.classList.remove('rem-height');
      collapsible.style.maxHeight = `${targetHeight}px`;

      setTimeout(() => {
        collapsible.classList.remove('is-open');
        collapsible.style.maxHeight = '0';

        setTimeout(() => {
          collapsible.setAttribute('hidden', '');
        }, 300);
      }, 50);
    }
  }

  private _hidable(this: void, hideable: HTMLElement, show: boolean): void {
    if (show) {
      hideable.removeAttribute('hidden');
    } else {
      hideable.setAttribute('hidden', '');
    }
  }

  private _setupCollapsibleTriggers(): void {
    const setupElement = (
      key: string,
      reverse: boolean,
      fn: (e: HTMLDivElement, state: boolean) => void,
    ): void => {
      const items = findElements<'input'>(`[${key}]`).sort((a, b) => {
        if (a.hasAttribute('runlast')) {
          return 1;
        }

        if (b.hasAttribute('runlast')) {
          return -1;
        }

        if (a.hasAttribute('runfirst')) {
          return -1;
        }

        if (b.hasAttribute('runfirst')) {
          return 1;
        }

        return 0;
      });

      items.forEach((item) => {
        const localFn = (): void => {
          const targets = findElements<'div'>(item.getAttribute(key)!);

          targets.forEach((target) => {
            fn(target, reverse ? !item.checked : item.checked);
          });
        };

        item.addEventListener('change', localFn);

        localFn();
      });
    };

    setupElement('enables', false, this._collapsible);
    setupElement('disables', true, this._collapsible);

    setupElement('hides', true, this._hidable);
    setupElement('shows', false, this._hidable);
  }
  //#endregion
}

new SettingsController();
