import { createElement } from '@shared/dom/create-element';
import { findElement } from '@shared/dom/find-element';
import { findElements } from '@shared/dom/find-elements';
import { withElement } from '@shared/dom/with-element';
import { ISatori } from './satori.interface';

export class SatoriMobile implements ISatori {
  private displayCategory = findElement('#nav-mobile-category-display');
  private displayCategoryAll = findElements(this.displayCategory, '.tab');
  private displayCategoryBreader = createElement('div', {
    class: ['tab', 'off'],
    innerText: 'JPDB Reader',
    id: 'nav-mobile-category-display-breader-tab',
    handler: (): void => this.activateTab('nav-mobile-category-display-breader-tab'),
  });

  private displayMenu = findElement('#nav-mobile-category-display-all');
  private displayMenuAll = findElements(this.displayMenu, '.leaf-set');
  private displayMenuBreader = createElement('div', {
    class: ['leaf-set'],
    style: { display: 'none' },
    id: 'nav-mobile-category-display-breader',
    children: [
      {
        tag: 'div',
        class: ['selection', 'on'],
        id: 'nav-mobile-touch-breader',
        innerText: 'Enable Lookup Events',
        handler: (): void => this.activeBreaderEvents(),
      },
      {
        tag: 'div',
        class: ['selection', 'off'],
        id: 'nav-mobile-touch-satori',
        innerText: 'Enable Satori Events',
        handler: (): void => this.activeSatoriEvents(),
      },
    ],
  });

  constructor(private switchMode: (useBreader: boolean) => void) {
    this.displayCategory?.insertAdjacentElement('afterbegin', this.displayCategoryBreader);
    this.displayMenu?.insertAdjacentElement('afterbegin', this.displayMenuBreader);

    this.initControls();
    this.activateTab('nav-mobile-category-display-breader-tab');
  }

  public setMode(breader: boolean): void {
    this.setClasses(breader);
  }

  public setDisplay(touchActive: boolean): void {
    this.displayCategoryBreader.style.display = touchActive ? '' : 'none';

    if (!touchActive) {
      if (this.displayCategoryBreader.classList.contains('on')) {
        this.activateTab(this.displayCategoryAll[0].id);
      }
    }
  }

  private initControls(): void {
    this.displayCategoryAll.forEach((el) => {
      el.addEventListener('click', () => {
        this.activateTab(el.id);
      });
    });
  }

  private activateTab(id: string): void {
    const activeTabType = id.split('-')[4];

    [...this.displayCategoryAll, this.displayCategoryBreader].forEach((el) => {
      el.classList.toggle('on', el.id === id);
      el.classList.toggle('off', el.id !== id);
    });

    [...this.displayMenuAll, this.displayMenuBreader].forEach((el) => {
      const isActive = el.id.includes(activeTabType);

      el.style.display = isActive ? 'block' : 'none';
    });
  }

  private activeBreaderEvents(): void {
    this.switchMode(true);
    this.setClasses(true);
  }

  private activeSatoriEvents(): void {
    this.switchMode(false);
    this.setClasses(false);
  }

  private setClasses(breader: boolean): void {
    withElement(this.displayMenuBreader, '#nav-mobile-touch-breader', (el) => {
      el.classList.toggle('on', breader);
      el.classList.toggle('off', !breader);
    });

    withElement(this.displayMenuBreader, '#nav-mobile-touch-satori', (el) => {
      el.classList.toggle('on', !breader);
      el.classList.toggle('off', breader);
    });
  }
}
