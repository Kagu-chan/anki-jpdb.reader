import { ConfigurationMonitor } from '@shared/configuration/configuration-monitor';
import { KeybindManager } from '../../integration/keybind-manager';
import { Registry } from '../../integration/registry';
import { AutomaticParser } from '../automatic.parser';
import { SatoriDesktop } from './satori/desktop';
import { SatoriMobile } from './satori/mobile';
import { SatoriOverlay } from './satori/overlay';

export class SatoriReaderParser extends AutomaticParser {
  private _keybindManager = new KeybindManager(['satoriReaderToggleEventSource']);

  private desktop = new SatoriDesktop((useBreader: boolean) => {
    this.enableBreader(useBreader);
  });
  private mobile = new SatoriMobile((useBreader: boolean) => {
    this.enableBreader(useBreader);
  });
  private overlay = new SatoriOverlay(
    (useBreader: boolean) => {
      this.enableBreader(useBreader);
    },
    () => this._lastState,
  );

  private _lastState = true;

  protected override init(): void {
    this.desktop.setMode(true);
    this.mobile.setMode(true);
    this.overlay.setMode();

    ConfigurationMonitor.watch(
      ['touchscreenSupport', 'satoriReaderShowToggleOverlayButton', 'disabledParsers'],
      ({ touchscreenSupport, satoriReaderShowToggleOverlayButton }) => {
        this.desktop.setDisplay(touchscreenSupport, satoriReaderShowToggleOverlayButton);
        this.mobile.setDisplay(touchscreenSupport, satoriReaderShowToggleOverlayButton);
        this.overlay.setDisplay(touchscreenSupport, satoriReaderShowToggleOverlayButton);

        this._keybindManager.setActive(touchscreenSupport);
      },
    );

    Registry.events.on('satoriReaderToggleEventSource', () => {
      this.enableBreader(!this._lastState);
    });
  }

  private enableBreader(isActive: boolean): void {
    this._lastState = isActive;

    this.desktop.setMode(isActive);
    this.mobile.setMode(isActive);
    this.overlay.setMode();

    Registry.skipTouchEvents = !isActive;
  }
}
