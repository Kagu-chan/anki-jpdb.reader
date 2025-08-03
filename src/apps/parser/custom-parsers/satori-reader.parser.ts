import { getConfiguration } from '@shared/configuration/get-configuration';
import { HostMeta } from '@shared/host-meta/types';
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

  constructor(meta: HostMeta) {
    super(meta);

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

  // private initMobileMode(): void {
  //   withElement('#nav-mobile-category-display', (container) => {
  //     const e = createElement('div', {
  //       class: ['tab', 'on'],
  //       id: 'nav-mobile-category-display-jpdb-tab',
  //       innerText: 'JPDB Reader',
  //     });

  //     container.insertAdjacentElement('afterbegin', e);
  //     this._elements.push(e);
  //     const all: HTMLElement[] = [];

  //     withElements(container, '.tab', (el) => {
  //       all.push(el);

  //       el.addEventListener('click', () => {
  //         if (el.classList.contains('on')) {
  //           return;
  //         }

  //         all.forEach((e) => {
  //           e.classList.toggle('on', false);
  //           e.classList.toggle('off', true);
  //         });

  //         el.classList.toggle('on', true);
  //         el.classList.toggle('off', false);
  //       });
  //     });
  //   });

  //   withElement('#nav-mobile-category-display-kanji-tab', (e) => {
  //     e.classList.toggle('on', false);
  //     e.classList.toggle('off', true);
  //   });

  //   withElement('#nav-mobile-category-display-all', (container) => {});
  // }

  // private activateBreaderEvents(): void {
  //   withElements('.use-breader', (el) => el.classList.toggle('on', true));
  //   withElements('.use-satori', (el) => el.classList.toggle('on', false));

  //   withElements('.use-breader', (el) => el.classList.toggle('off', false));
  //   withElements('.use-satori', (el) => el.classList.toggle('off', true));

  //   this._useBreader = true;
  // }

  // private activateSatoriEvents(): void {
  //   withElements('.use-satori', (el) => el.classList.toggle('on', true));
  //   withElements('.use-breader', (el) => el.classList.toggle('on', false));

  //   withElements('.use-satori', (el) => el.classList.toggle('off', false));
  //   withElements('.use-breader', (el) => el.classList.toggle('off', true));

  //   this._useBreader = false;
  // }
}
