import { DEFAULT_CONFIGURATION } from '@shared/configuration/default-configuration';
import { getConfiguration } from '@shared/configuration/get-configuration';
import { setConfiguration } from '@shared/configuration/set-configuration';
import { ConfigurationSchema } from '@shared/configuration/types';
import { createElement } from '@shared/dom/create-element';
import { displayToast } from '@shared/dom/display-toast';
import { findElement } from '@shared/dom/find-element';
import { withElement } from '@shared/dom/with-element';
import { withElements } from '@shared/dom/with-elements';
import { getVersion } from '@shared/extension/get-version';
import { ping } from '@shared/jpdb/ping';
import { JPDBDeck } from '@shared/jpdb/types';
import { FetchDecksCommand } from '@shared/messages/background/fetch-decks.command';
import { ConfigurationUpdatedCommand } from '@shared/messages/broadcast/configuration-updated.command';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';
import { HTMLColorInputElement } from './elements/html-color-input-element';
import { HTMLFeaturesInputElement } from './elements/html-features-input-element';
import { HTMLKeybindInputElement } from './elements/html-keybind-input-element';
import { HTMLMiningInputElement } from './elements/html-mining-input-element';
import { HTMLParsersInputElement } from './elements/html-parsers-input-element';
import { HTMLStateCategoryInputElement } from './elements/html-state-category-input-element';

customElements.define('mining-input', HTMLMiningInputElement);
customElements.define('keybind-input', HTMLKeybindInputElement);
customElements.define('parsers-input', HTMLParsersInputElement);
customElements.define('features-input', HTMLFeaturesInputElement);
customElements.define('state-category-input', HTMLStateCategoryInputElement);
customElements.define('color-input', HTMLColorInputElement);

const localConfiguration = new Map<
  keyof ConfigurationSchema,
  ConfigurationSchema[keyof ConfigurationSchema]
>();
const bindings = new Map<string, Set<HTMLElement>>();
const validators: Partial<
  Record<keyof ConfigurationSchema, (value: unknown) => boolean | Promise<boolean>>
> = {
  jpdbApiToken: validateJPDBApiKey,
};

const configurationUpdatedCommand = new ConfigurationUpdatedCommand();
const fetchDecksCommand = new FetchDecksCommand();

const jpdbDeckFields = new Map<HTMLSelectElement, string>();
let suppressChangeNotifications = false;

//#region Init Interactions

findElement('#version').innerText = `v${getVersion()}`;

withFields(async (field: HTMLInputElement) => {
  await loadField(field);

  field.onchange = (): void => {
    const checkbox = field.type === 'checkbox';
    const value = checkbox ? field.checked : field.value;

    void validateAndSet(field.name as keyof ConfigurationSchema, value, async () => {
      await setConfiguration(field.name as keyof ConfigurationSchema, value);
      configurationUpdatedCommand.send();

      if (!suppressChangeNotifications) {
        displayToast('success', 'Settings saved successfully', undefined, true);
      }
    });
  };
});

withElement('#apiTokenButton', (button) => {
  button.onclick = (): void => {
    withElement('#jpdbApiToken', (i: HTMLInputElement) => {
      void validateJPDBApiKey(i.value);
    });
  };
});

//#region Import / Export

withElement('#export-settings', (button) => {
  button.onclick = (event: Event): void => {
    event.stopPropagation();
    event.preventDefault();

    const downloadTitleWithDate = `configuration-${new Date().toISOString().slice(0, 10)}.json`;

    void chrome.storage.local.get().then((configuration) => {
      delete configuration.jpdbApiToken;

      const blob = new Blob([JSON.stringify(configuration, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = createElement('a', {
        attributes: { href: url, download: downloadTitleWithDate },
      });

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    });
  };
});

withElement('#import-settings', (button) => {
  button.onclick = (event: Event): void => {
    event.stopPropagation();
    event.preventDefault();

    const fileInput = createElement('input', {
      attributes: { type: 'file', accept: '.json' },
    });

    fileInput.onchange = async (): Promise<void> => {
      if (!fileInput.files?.length) {
        return;
      }

      const file = fileInput.files[0];
      const text = await file.text();
      const data = JSON.parse(text) as Record<keyof ConfigurationSchema, string>;

      Object.keys(data).forEach((key: keyof ConfigurationSchema) => {
        if (!Object.keys(DEFAULT_CONFIGURATION).includes(key)) {
          delete data[key];
        }

        if (typeof data[key] !== 'string') {
          data[key] = JSON.stringify(data[key]);
        }
      });

      data.jpdbApiToken = await getConfiguration('jpdbApiToken');

      await chrome.storage.local.clear();
      await chrome.storage.local.set(data);

      configurationUpdatedCommand.send();
      suppressChangeNotifications = true;

      withFields(
        (field: HTMLInputElement) => loadField(field),
        () => {
          displayToast('success', 'Settings imported', undefined, true);

          suppressChangeNotifications = false;
        },
      );
    };

    fileInput.click();
  };
});

//#endregion Import / Export

onBroadcastMessage('deckListUpdated', (decks) => {
  const dropdownDecks: (JPDBDeck | { id: ''; name: string })[] = [
    { id: '', name: '[None]' },
    ...decks,
  ];

  withElements('select[data-type=jpdb-deck]', (element: HTMLSelectElement) => {
    const currentValue = jpdbDeckFields.get(element);

    element.replaceChildren(
      ...dropdownDecks.map((deck) =>
        createElement('option', {
          innerText: deck.name,
          attributes: { value: deck.id!.toString() },
        }),
      ),
    );

    if (dropdownDecks.some((deck) => deck.id == currentValue)) {
      element.value = currentValue!;
    }
  });
});

//#endregion
//#region Field Updates

function afterValueUpdated(
  key: keyof ConfigurationSchema,
  value: ConfigurationSchema[keyof ConfigurationSchema],
): void {
  localConfiguration.set(key, value);

  updateBindings(key);
}

async function validateAndSet(
  key: keyof ConfigurationSchema,
  value: ConfigurationSchema[keyof ConfigurationSchema],
  afterValidate?: () => void | Promise<void>,
): Promise<void> {
  if (validators[key]) {
    const isValid = await validators[key](value);

    if (!isValid) {
      updateBindings(key);

      return;
    }
  }

  afterValueUpdated(key, value);

  await afterValidate?.();
}

//#endregion
//#region Field Bindings

withElements('[data-show]', (element) => {
  const attributeValue = element.getAttribute('data-show');

  /**
   * The property resembles a javascript condition - the following are valid
   *
   * - myProperty
   * - !myProperty
   * - myProperty['includeString']
   * - myProperty = 'someValue'
   * - myProperty != 'someValue'
   * - myProperty && !myOtherProperty
   * - myProperty || myOtherProperty
   * - (myProperty && myOtherProperty) || !myThirdProperty
   */

  const fields =
    Array.from(
      new Set(
        attributeValue
          ?.replace(/'[^']*'/g, '')
          .match(/(\w+(\['[^']+'\])?)/g)
          ?.map((field) => field.replace(/\['[^']+'\]/g, '').trim())
          .filter(Boolean),
      ),
    ) ?? [];

  for (const f of fields) {
    if (!bindings.has(f)) {
      bindings.set(f, new Set());
    }

    bindings.get(f)!.add(element);
  }
});

function updateBindings(key: keyof ConfigurationSchema): void {
  const affected = bindings.get(key);

  if (!affected?.size) {
    return;
  }

  for (const current of affected) {
    const attributeValue = current.getAttribute('data-show');

    if (!attributeValue) {
      continue;
    }

    current.style.display = parseCondition(attributeValue) ? '' : 'none';
  }
}

function parseCondition(expr: string): boolean {
  // Tokenize
  const tokens = expr
    .replace(/!=/g, ' != ')
    .replace(/([()])/g, ' $1 ')
    .replace(/!(?!=)/g, ' ! ')
    .replace(/(?<!!)=/g, ' = ')
    .replace(/&&/g, ' && ')
    .replace(/\|\|/g, ' || ')
    .match(/'[^']*'|\S+/g)
    ?.filter(Boolean) ?? [];

  let pos = 0;

  function peek(): string {
    return tokens[pos];
  }

  function next(): string {
    return tokens[pos++];
  }

  function toBoolean(value: string | boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    return value.length > 0;
  }

  function parseAtom(): string | boolean {
    const token = peek();

    if (token === '(') {
      next(); // consume '('
      const value = parseOr();

      // consume ')'
      if (next() !== ')') {
        throw new Error('Expected )');
      }

      return value;
    }

    if (token === '!') {
      next(); // consume '!'
      const value = parseAtom();

      return !toBoolean(value);
    }

    // Load and validate configuration key
    next(); // consume and shift pointer

    if (/^'[^']*'$/.test(token)) {
      return token.slice(1, -1);
    }

    const match = /^(\w+)(\['([^']+)'\])?$/.exec(token);
    // match will contain [ entire match, key, full prop access (if any), prop (if any) ] - key replaces token
    const [, key, , prop] = match!;

    const fallback = DEFAULT_CONFIGURATION[key as keyof ConfigurationSchema]; // fallback used for unset values or unknown keys
    let value = localConfiguration.get(key as keyof ConfigurationSchema) ?? fallback;

    if (fallback === undefined) {
      throw new Error(`Unknown configuration key: ${key}`);
    }

    // If array access and value is array, value equals whether prop is in array
    if (prop && Array.isArray(value)) {
      value = (value as string[]).includes(prop);
    }

    return value as string | boolean;
  }

  function parseComparison(): boolean {
    const left = parseAtom();
    const operator = peek();

    if (operator === '=' || operator === '!=') {
      next();
      const right = parseAtom();

      return operator === '=' ? left === right : left !== right;
    }

    return toBoolean(left);
  }

  function parseAnd(): boolean {
    let value = parseComparison();

    while (peek() === '&&') {
      next();
      const comperand = parseComparison(); // While left side may already be false, right side needs to be evaluated to be consumed correctly

      value = value && comperand;
    }

    return value;
  }

  function parseOr(): boolean {
    let value = parseAnd();

    while (peek() === '||') {
      next();
      const comperand = parseAnd(); // While left side may already be true, right side needs to be evaluated to be consumed correctly

      value = value || comperand;
    }

    return value;
  }

  if (!tokens.length) {
    return false;
  }

  try {
    const result = parseOr();

    if (pos !== tokens.length) {
      throw new Error('Unexpected token');
    }

    return result;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Parser', 'Error during parsing', e);

    return false;
  }
}

//#endregion
//#region Validators

async function validateJPDBApiKey(value: string): Promise<boolean> {
  let isValid = false;

  if (value?.length) {
    try {
      await ping({ apiToken: value });

      isValid = true;
    } catch (_e) {
      /* NOP */
    }
  }

  const button = findElement('#apiTokenButton');
  const input = findElement('#jpdbApiToken');

  button.classList.toggle('v1', !isValid);
  input.classList.toggle('v1', !isValid);

  if (isValid) {
    fetchDecksCommand.send();
  }

  return isValid;
}

//#endregion
//#region Helpers

function withFields(cb: (field: HTMLInputElement) => Promise<void>, afterAll?: () => void): void {
  const promises = [] as Promise<void>[];

  withElements(
    'input, textarea, select, keybind-input, parsers-input, features-input, state-category-input, color-input',
    (field: HTMLInputElement) => {
      const internal = field.hasAttribute('internal');
      const ignored = ['hidden', 'submit', 'button'];

      if (internal || ignored.includes(field.type)) {
        return;
      }

      promises.push(cb(field));
    },
  );

  void Promise.all(promises).then(() => afterAll?.());
}

async function loadField(field: HTMLInputElement): Promise<void> {
  const value = await getConfiguration(field.name as keyof ConfigurationSchema);
  const checkbox = field.type === 'checkbox';
  const isJPDBDeck = field.getAttribute('data-type') === 'jpdb-deck';

  if (isJPDBDeck) {
    jpdbDeckFields.set(field as unknown as HTMLSelectElement, value as string);

    return;
  }

  if (checkbox) {
    field.checked = value as boolean;
  } else {
    field.value = value as string;
  }

  await validateAndSet(field.name as keyof ConfigurationSchema, value);
}
//#endregion
