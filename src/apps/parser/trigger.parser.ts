import { getConfiguration } from '@shared/configuration/get-configuration';
import { createElement } from '@shared/dom/create-element';
import { getStyleUrl } from '@shared/extension/get-style-url';
import { isDisabled } from '@shared/host-meta/is-disabled';
import { HostMeta } from '@shared/host-meta/types';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';
import { receiveBackgroundMessage } from '@shared/messages/receiving/receive-background-message';
import { KeybindManager } from '../integration/keybind-manager';
import { Registry } from '../integration/registry';
import { BaseParser } from './base.parser';

export class TriggerParser extends BaseParser {
  protected _parseKeyManager = new KeybindManager(['parseKey']);
  protected _buttonRoot = createElement('div', {
    id: 'ajb-parse-button',
  });

  constructor(meta: HostMeta) {
    super(meta);

    this._parseKeyManager.activate();

    Registry.events.on('parseKey', () => {
      this.initParse();
    });

    receiveBackgroundMessage('parsePage', () => this.parsePage());
    receiveBackgroundMessage('parseSelection', () => this.parseSelection());

    onBroadcastMessage(
      'configurationUpdated',
      async () => {
        this._buttonRoot.classList.toggle(
          'hidden',
          !(await getConfiguration('showParseButton', true)),
        );
      },
      true,
    );

    void isDisabled(window.location.href).then((disabled) => {
      if (!disabled) {
        this.installParseButton();
      }
    });
  }

  private initParse(): void {
    this._buttonRoot.style.display = 'none';

    if (window.getSelection()?.toString()) {
      return this.parseSelection();
    }

    return this.parsePage();
  }

  private installParseButton(): void {
    const shadowRoot = this._buttonRoot.attachShadow({ mode: 'open' });

    shadowRoot.append(
      createElement('link', {
        attributes: { rel: 'stylesheet', href: getStyleUrl('parse') },
      }),
      createElement('div', { innerText: 'Parse', handler: () => this.initParse() }),
    );

    document.body.appendChild(this._buttonRoot);
  }
}
