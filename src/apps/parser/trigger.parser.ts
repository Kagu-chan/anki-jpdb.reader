import { HostMeta } from '@shared/host-meta';
import { receiveBackgroundMessage } from '@shared/messages';
import { KeybindManager } from '../integration/keybind-manager';
import { Registry } from '../integration/registry';
import { BaseParser } from './base.parser';

export class TriggerParser extends BaseParser {
  protected _parseKeyManager = new KeybindManager(['parseKey']);

  constructor(meta: HostMeta) {
    super(meta);

    this._parseKeyManager.activate();

    Registry.events.on('parseKey', () => {
      if (window.getSelection()?.toString()) {
        return this.parseSelection();
      }

      return this.parsePage();
    });

    receiveBackgroundMessage('parsePage', () => this.parsePage());
    receiveBackgroundMessage('parseSelection', () => this.parseSelection());
  }
}
