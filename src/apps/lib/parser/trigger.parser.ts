import { KeybindManager } from '../keybind-manager';
import { BaseParser } from './base.parser';

export class TriggerParser extends BaseParser {
  protected _parseKeyManager: KeybindManager;

  /**
   * Setup keyboard and extension events to parse the current page or selection
   *
   * @inheritdoc
   */
  protected setup(): void {
    this._parseKeyManager = new KeybindManager(['parseKey']);
    this._parseKeyManager.activate();

    this.on('parseKey', () => {
      if (window.getSelection()?.toString()) {
        return this.parseSelection();
      }

      return this.parsePage();
    });

    this.listen('parsePage', () => this.parsePage());
    this.listen('parseSelection', () => this.parseSelection());
  }
}
