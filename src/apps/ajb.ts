import { displayToast } from '@shared/dom';
import { receiveBackgroundMessage, sendToBackground } from '@shared/messages';
import { KeybindManager } from './integration/keybind-manager';
import { Registry } from './integration/registry';
import { AutomaticParser } from './parser/automatic.parser';
import { getCustomParser } from './parser/get-custom-parser';
import { NoParser } from './parser/no.parser';
import { TriggerParser } from './parser/trigger.parser';
import { PopupManager } from './popup/popup-manager';

export class AJB {
  private _lookupKeyManager = new KeybindManager(['lookupSelectionKey']);

  constructor() {
    this._lookupKeyManager.activate();

    receiveBackgroundMessage('toast', displayToast);
    Registry.events.on('lookupSelectionKey', () =>
      this.lookupText(window.getSelection()?.toString()),
    );

    this.installParsers();

    Registry.popupManager = new PopupManager();
  }

  protected async lookupText(text: string | undefined): Promise<void> {
    if (!text?.length) {
      displayToast('error', 'No text to lookup!');

      return;
    }

    await sendToBackground('lookupText', text);
  }

  private installParsers(): void {
    const { hostEvaluator, parsers } = Registry;

    void hostEvaluator.load().then(({ canBeTriggered, relevantMeta }) => {
      if (!canBeTriggered) {
        parsers.push(new NoParser(hostEvaluator.rejectionReason));
      }

      for (const meta of relevantMeta) {
        if (!meta.auto) {
          if (!meta.disabled) {
            parsers.push(new TriggerParser(meta));
          }

          continue;
        }

        if (meta.custom) {
          parsers.push(getCustomParser(meta.custom, meta));

          continue;
        }

        parsers.push(new AutomaticParser(meta));
      }
    });
  }
}

new AJB();
