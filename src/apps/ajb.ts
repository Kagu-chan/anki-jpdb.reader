import { debug } from '@shared/debug';
import { displayToast } from '@shared/dom/display-toast';
import { FlatHostMeta, SingleParserHostMeta } from '@shared/host-meta/types';
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

export class AJB {
  private _lookupKeyManager = new KeybindManager(['lookupSelectionKey']);

  constructor() {
    void this.initialize();
  }

  protected async initialize(): Promise<void> {
    debug('Initialize AJB', { mainFrame: window === window.top });

    await Registry.textHighlighterOptions.initialized;

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

    await this.installFeatures();
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
    const isPredefined = (meta: FlatHostMeta): meta is SingleParserHostMeta => 'id' in meta;

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
