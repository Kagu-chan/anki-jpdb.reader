import { ConfigurationMonitor } from '@shared/configuration/configuration-monitor';
import { Registry } from '../../integration/registry';
import { AutomaticParser } from '../automatic.parser';
import { SatoriDesktop } from './satori/desktop';
import { SatoriMobile } from './satori/mobile';

export class SatoriReaderParser extends AutomaticParser {
  private desktop = new SatoriDesktop((useBreader: boolean) => {
    this.enableBreader(useBreader);
  });
  private mobile = new SatoriMobile((useBreader: boolean) => {
    this.enableBreader(useBreader);
  });

  protected override init(): void {
    this.desktop.setMode(true);
    this.mobile.setMode(true);

    ConfigurationMonitor.watch(['touchscreenSupport'], ({ touchscreenSupport }) => {
      this.desktop.setDisplay(touchscreenSupport);
      this.mobile.setDisplay(touchscreenSupport);
    });
  }

  private enableBreader(isActive: boolean): void {
    this.desktop.setMode(isActive);
    this.mobile.setMode(isActive);

    Registry.skipTouchEvents = !isActive;
  }
}
