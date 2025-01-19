import { getConfiguration } from '@shared/configuration';
import { displayToast } from '@shared/dom';
import { JPDBCardState } from '@shared/jpdb';
import { LookupTextCommand, onBroadcastMessage, receiveBackgroundMessage } from '@shared/messages';
import { KeybindManager } from './integration/keybind-manager';
import { Registry } from './integration/registry';
import { AutomaticParser } from './parser/automatic.parser';
import { getCustomParser } from './parser/get-custom-parser';
import { NoParser } from './parser/no.parser';
import { TriggerParser } from './parser/trigger.parser';
import { PopupManager } from './popup/popup-manager';
import { LegacyTextHighlighter } from './text-highlighter/legacy-text-highlighter';
import { TextHighlighter } from './text-highlighter/text-highlighter';

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

    onBroadcastMessage('cardStateUpdated', (vid: number, sid: number, state: JPDBCardState[]) => {
      Registry.updateCard(vid, sid, state);
    });

    onBroadcastMessage(
      'configurationUpdated',
      async (): Promise<void> => {
        const useLegacyHighlighter = await getConfiguration('useLegacyHighlighter', true);

        Registry.textHighlighter = useLegacyHighlighter ? LegacyTextHighlighter : TextHighlighter;
      },
      true,
    );
  }

  protected lookupText(text: string | undefined): void {
    if (!text?.length) {
      displayToast('error', 'No text to lookup!');

      return;
    }

    new LookupTextCommand(text).send();
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
