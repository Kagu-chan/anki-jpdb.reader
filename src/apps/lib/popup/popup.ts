import { getConfiguration } from '@shared/configuration';
import { createElement } from '@shared/dom';
import { getStyleUrl } from '@shared/extension';
import { onBroadcastMessage } from '@shared/messages';

export class Popup {
  private _initialized = false;

  private _hidePopupAutomatically: boolean;
  private _hidePopupDelay: number;
  private _disableFadeAnimation: boolean;

  private _hideTimer?: NodeJS.Timeout;
  private _isVisible = false;

  private _context?: HTMLElement;
  private _shadowRoot?: ShadowRoot;
  private _popup: HTMLDivElement = createElement('div');

  constructor() {
    void this.setup();
  }

  public show(context: HTMLElement): void {
    if (!this._initialized) {
      return;
    }

    this._context = context;

    this.rerender();

    if (this._isVisible) {
      return;
    }

    this._isVisible = true;

    this._popup.classList.remove('popup-hidden');
    this._popup.classList.add('popup-visible');
  }

  public hide(): void {
    if (!this._initialized) {
      return;
    }

    if (this._hidePopupAutomatically) {
      if (this._hideTimer) {
        clearTimeout(this._hideTimer);
      }

      this._hideTimer = setTimeout(() => this.processHide(), this._hidePopupDelay);

      return;
    }

    this.processHide();
  }

  private processHide(): void {
    this._popup.classList.remove('popup-visible');
    this._popup.classList.add('popup-hidden');
  }

  private async setup(): Promise<void> {
    await this.loadConfiguration();

    onBroadcastMessage('configurationUpdated', () => this.loadConfiguration());

    const shadowRootContainer = createElement('div', {
      id: 'ajb-popup-container',
    });

    this._shadowRoot = shadowRootContainer.attachShadow({ mode: 'open' });
    this._shadowRoot.append(
      createElement('link', {
        attributes: { rel: 'stylesheet', href: getStyleUrl('popup') },
      }),
      this._popup,
    );

    document.body.appendChild(shadowRootContainer);

    this._initialized = true;
  }

  private async loadConfiguration(): Promise<void> {
    this._hidePopupAutomatically = await getConfiguration('hidePopupAutomatically');
    this._hidePopupDelay = await getConfiguration('hidePopupDelay');
    this._disableFadeAnimation = await getConfiguration('disableFadeAnimation');

    if (this._disableFadeAnimation) {
      this._popup.classList.remove('animated');

      return;
    }

    this._popup.classList.add('animated');
  }

  private rerender(): void {
    if (!this._context) {
      return;
    }

    const { x, y } = this._context.getBoundingClientRect();

    this._popup.style.left = `${x}px`;
    this._popup.style.top = `${y}px`;

    this._popup.innerHTML = this._context.outerHTML;
  }
}
