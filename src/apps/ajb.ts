import { getConfiguration } from '@shared/configuration/get-configuration';
import { debug } from '@shared/debug';
import { displayToast } from '@shared/dom/display-toast';
import { HostMeta, PredefinedHostMeta } from '@shared/host-meta/types';
import { JPDBCardState } from '@shared/jpdb/types';
import { LookupTextCommand } from '@shared/messages/background/lookup-text.command';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';
import { receiveBackgroundMessage } from '@shared/messages/receiving/receive-background-message';
import { getFeatures } from './features/get-features';
import { KeybindManager } from './integration/keybind-manager';
import { NoFocusTrigger } from './integration/no-focus-trigger';
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
    debug('Initialize AJB', { mainFrame: window === window.top });

    this._lookupKeyManager.activate();

    NoFocusTrigger.get().install();

    receiveBackgroundMessage('toast', displayToast);
    Registry.events.on('lookupSelectionKey', () => {
      this.withHiddenRT(() => {
        this.lookupText(window.getSelection()?.toString());
      });
    });

    this.installParsers();

    Registry.popupManager = new PopupManager();

    onBroadcastMessage('cardStateUpdated', (vid: number, sid: number, state: JPDBCardState[]) => {
      Registry.updateCard(vid, sid, state);
    });

    onBroadcastMessage(
      'configurationUpdated',
      async (): Promise<void> => {
        const useLegacyHighlighter = await getConfiguration('useLegacyHighlighter', true);
        const skipFurigana = await getConfiguration('skipFurigana', false);
        const generatePitch = await getConfiguration('generatePitch', false);
        const markTopX = await getConfiguration('markTopX', false);
        const markTopXCount = await getConfiguration('markTopXCount', true);
        const markAllTypes = await getConfiguration('markAllTypes', false);
        const markSuspended = await getConfiguration('markSuspended', false);

        Registry.textHighlighter = useLegacyHighlighter ? LegacyTextHighlighter : TextHighlighter;
        Registry.textHighlighterOptions = {
          skipFurigana,
          generatePitch,
          markFrequency: markTopX ? markTopXCount : false,
          markSuspended,
          markAll: markAllTypes,
        };
      },
      true,
    );

    void this.installFeatures();
  }

  protected lookupText(text: string | undefined): void {
    if (!text?.length) {
      displayToast('error', 'No text to lookup!');

      return;
    }

    new LookupTextCommand(text).send();
  }

  protected withHiddenRT(action: () => void): void {
    const style = document.createElement('style');

    style.innerText = 'rt { display: none !important; }';
    document.head.appendChild(style);

    try {
      action();
    } finally {
      document.head.removeChild(style);
    }
  }

  protected installParsers(): void {
    const { hostEvaluator, parsers } = Registry;
    const isPredefined = (meta: HostMeta): meta is PredefinedHostMeta => 'id' in meta;

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

        if (isPredefined(meta) && meta.custom) {
          parsers.push(getCustomParser(meta.custom, meta));

          continue;
        }

        parsers.push(new AutomaticParser(meta));
      }
    });
  }

  protected async installFeatures(): Promise<void> {
    const features = await getFeatures();

    for (const feature of features) {
      feature.apply();
    }
  }
}

new AJB();
