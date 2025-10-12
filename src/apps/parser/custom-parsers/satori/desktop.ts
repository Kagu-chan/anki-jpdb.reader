import { createElement } from '@shared/dom/create-element';
import { findElement } from '@shared/dom/find-element';
import { withElements } from '@shared/dom/with-elements';
import { ISatori } from './satori.interface';

export class SatoriDesktop implements ISatori {
  private articleControls = findElement('#article-controls-container .article-controls');
  private breaderSection = createElement('div', {
    class: 'controls-section',
    children: [
      {
        tag: 'h3',
        innerText: 'JPDB Reader',
      },
      {
        tag: 'div',
        class: 'control-group',
        id: 'jpdb-reader',
        children: [
          {
            tag: 'span',
            class: ['radio', 'use-breader'],
            handler: (): void => this.activateBreaderEvents(),
          },
          {
            tag: 'span',
            class: ['label', 'use-breader'],
            handler: (): void => this.activateBreaderEvents(),
            innerText: 'Enable Lookup Events',
          },
          { tag: 'br' },
          {
            tag: 'span',
            class: ['radio', 'use-satori'],
            handler: (): void => this.activateSatoriEvents(),
          },
          {
            tag: 'span',
            class: ['label', 'use-satori'],
            handler: (): void => this.activateSatoriEvents(),
            innerText: 'Enable Satori Events',
          },
          { tag: 'br' },
        ],
      },
    ],
  });

  constructor(private switchMode: (useBreader: boolean) => void) {
    this.articleControls?.insertAdjacentElement('afterbegin', this.breaderSection);
  }

  public setMode(breader: boolean): void {
    this.setClasses(breader);
  }

  public setDisplay(touchActive: boolean, overlayActive: boolean): void {
    this.breaderSection.style.display = touchActive && !overlayActive ? 'block' : 'none';
  }

  private activateBreaderEvents(): void {
    this.switchMode(true);
    this.setClasses(true);
  }

  private activateSatoriEvents(): void {
    this.switchMode(false);
    this.setClasses(false);
  }

  private setClasses(breader: boolean): void {
    withElements(this.breaderSection, '.use-breader', (el) => {
      el.classList.toggle('on', breader);
      el.classList.toggle('off', !breader);
    });

    withElements(this.breaderSection, '.use-satori', (el) => {
      el.classList.toggle('on', !breader);
      el.classList.toggle('off', breader);
    });
  }
}
