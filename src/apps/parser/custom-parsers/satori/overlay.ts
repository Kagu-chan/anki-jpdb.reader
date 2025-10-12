import { createElement } from '@shared/dom/create-element';
import { getStyleUrl } from '@shared/extension/get-style-url';
import { ISatori } from './satori.interface';

export class SatoriOverlay implements ISatori {
  public id = crypto.randomUUID();
  private _buttonRoot = createElement('div', {
    id: 'ajb-overlay-control-button',
  });
  private _button: HTMLElement | null = null;

  private get text(): string {
    return this.isActive() ? 'Switch to Satori Events' : 'Switch to Lookup Events';
  }

  constructor(
    private switchMode: (useBreader: boolean) => void,
    private isActive: () => boolean,
  ) {
    this.initControls();
  }

  public setMode(): void {
    this._button!.innerText = this.text;
  }

  public setDisplay(touchActive: boolean, overlayActive: boolean): void {
    this._buttonRoot.style.display = touchActive && overlayActive ? 'block' : 'none';
  }

  private initControls(): void {
    const shadowRoot = this._buttonRoot.attachShadow({ mode: 'open' });

    this._button = createElement('div', {
      innerText: this.text,
      handler: () => this.switchMode(!this.isActive()),
    });

    shadowRoot.append(
      createElement('link', {
        attributes: { rel: 'stylesheet', href: getStyleUrl('overlay-control') },
      }),
      this._button,
    );

    document.body.appendChild(this._buttonRoot);
  }
}
