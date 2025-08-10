import { getConfiguration } from '@shared/configuration/get-configuration';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';
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

    onBroadcastMessage(
      'configurationUpdated',
      async () => {
        const touchActive = await getConfiguration('touchscreenSupport', true);

        this.desktop.setDisplay(touchActive);
        this.mobile.setDisplay(touchActive);
      },
      true,
    );
  }

  private enableBreader(isActive: boolean): void {
    this.desktop.setMode(isActive);
    this.mobile.setMode(isActive);

    Registry.skipTouchEvents = !isActive;
  }
}
