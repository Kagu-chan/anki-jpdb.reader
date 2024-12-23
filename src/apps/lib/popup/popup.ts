import { getConfiguration } from '@shared/configuration';
import { createElement, withElement } from '@shared/dom';
import { getStyleUrl } from '@shared/extension';
import { JPDBGrade } from '@shared/jpdb';
import { onBroadcastMessage, sendToBackground } from '@shared/messages';
import { PARTS_OF_SPEECH } from './part-of-speech';

export class Popup {
  private _initialized = false;

  private _hidePopupAutomatically: boolean;
  private _hidePopupDelay: number;
  private _disableFadeAnimation: boolean;

  private _hideTimer?: NodeJS.Timeout;
  private _isVisible = false;
  private _isHover = false;

  private _cardContext?: HTMLElement;
  private _shadowRoot?: ShadowRoot;
  private _customStyles: HTMLStyleElement = createElement('style');

  private _mineButtons = createElement('section', { id: 'mining' });
  private _gradeButtons = createElement('section', { id: 'grading' });
  private _context = createElement('section', { id: 'context' });
  private _details = createElement('section', { id: 'details' });
  private _popup: HTMLDivElement = createElement('div', {
    class: ['popup', 'popup-hidden'],
    events: {
      onmousedown: (ev: MouseEvent) => ev.stopPropagation(),
      onclick: (ev: MouseEvent) => ev.stopPropagation(),
      onwheel: (ev: WheelEvent) => ev.stopPropagation(),
      onmouseenter: () => this.startHover(),
      onmouseleave: () => this.stopHover(),
      keydown: (ev: KeyboardEvent) => {
        if (ev.key === 'Escape' && this._isVisible) {
          this.processHide();
        }
      },
    },
    children: [this._mineButtons, this._gradeButtons, this._context, this._details],
  });

  constructor() {
    void this.setup();
  }

  public show(context: HTMLElement): void {
    if (!this._initialized) {
      return;
    }

    this._cardContext = context;

    this.clearTimeout();
    this.rerender();

    if (this._isVisible) {
      return;
    }

    this._isVisible = true;

    this._popup.classList.remove('popup-hidden');
    this._popup.classList.add('popup-visible');
  }

  public hide(): void {
    if (!this._initialized || this._isHover) {
      return;
    }

    this.clearTimeout();

    if (this._hidePopupAutomatically) {
      this._hideTimer = setTimeout(() => this.processHide(), this._hidePopupDelay);

      return;
    }
  }

  private startHover(): void {
    this._isHover = true;

    this.clearTimeout();
  }

  private stopHover(): void {
    this._isHover = false;

    this.clearTimeout();

    if (this._hidePopupAutomatically) {
      this._hideTimer = setTimeout(() => this.processHide(), this._hidePopupDelay);

      return;
    }
  }

  private clearTimeout(): void {
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
    }
  }

  private processHide(): void {
    this._isVisible = false;

    this._popup.classList.remove('popup-visible');
    this._popup.classList.add('popup-hidden');
  }

  private cardHasState(state: 'neverForget' | 'blacklist'): boolean {
    const { cardState } = this._cardContext!.ajbContext!.token.card;
    const lookupState = state === 'neverForget' ? 'never-forget' : 'blacklisted';

    return cardState.includes(lookupState);
  }

  private async setup(): Promise<void> {
    await this.applyConfiguration();

    onBroadcastMessage('configurationUpdated', () => this.applyConfiguration());
    onBroadcastMessage('cardStateUpdated', () => this.rerender());

    const shadowRootContainer = createElement('div', {
      id: 'ajb-popup-container',
    });

    this._shadowRoot = shadowRootContainer.attachShadow({ mode: 'open' });
    this._shadowRoot.append(
      ...['theme', 'common', 'popup'].map((s) =>
        createElement('link', { attributes: { rel: 'stylesheet', href: getStyleUrl(s) } }),
      ),
      this._popup,
    );

    document.body.appendChild(shadowRootContainer);
    document.addEventListener('click', () => {
      if (this._isVisible && !this._isHover) {
        this.processHide();
      }
    });

    this._initialized = true;
  }

  private async applyConfiguration(): Promise<void> {
    this._hidePopupAutomatically = await getConfiguration('hidePopupAutomatically');
    this._hidePopupDelay = await getConfiguration('hidePopupDelay');
    this._disableFadeAnimation = await getConfiguration('disableFadeAnimation');

    this._customStyles.textContent = await getConfiguration('customPopupCSS', true);

    await this.updateMiningButtons();
    await this.updateGradingButtons();

    if (this._disableFadeAnimation) {
      this._popup.classList.remove('animated');

      return;
    }

    this._popup.classList.add('animated');
  }

  private async updateMiningButtons(): Promise<void> {
    const miningDeck = await getConfiguration('jpdbMiningDeck');
    const neverForget = await getConfiguration('jpdbNeverForgetDeck');
    const blacklist = await getConfiguration('jpdbBlacklistDeck');

    const miningButtons: HTMLElement[] = [];
    const add = (deck: string, id: string, text?: string, handler?: () => void): void => {
      if (deck?.length) {
        miningButtons.push(
          createElement('span', {
            id: `${id}-deck`,
            class: ['mining-button', 'button', 'outline', id],
            innerText: text,
            handler,
          }),
        );
      }
    };
    const performDeckAction = (
      action: 'add' | 'remove',
      key: 'mining' | 'neverForget' | 'blacklist',
    ): void => {
      const { vid, sid } = this._cardContext!.ajbContext!.token.card;

      void sendToBackground('runDeckAction', vid, sid, key, action).then(() =>
        sendToBackground('updateCardState', vid, sid),
      );
    };
    const performFlaggedDeckAction = (key: 'neverForget' | 'blacklist'): void => {
      const action = this.cardHasState(key) ? 'remove' : 'add';

      performDeckAction(action, key);
    };

    add(miningDeck, 'mining', 'Add', () => performDeckAction('add', 'mining'));
    add(neverForget, 'never-forget', undefined, () => performFlaggedDeckAction('neverForget'));
    add(blacklist, 'blacklist', undefined, () => performFlaggedDeckAction('blacklist'));

    this._mineButtons.replaceChildren(...miningButtons);
  }

  private async updateGradingButtons(): Promise<void> {
    const useTwoPointGrading = await getConfiguration('jpdbUseTwoGrades');
    const buttons: JPDBGrade[] = useTwoPointGrading
      ? ['fail', 'pass']
      : ['nothing', 'something', 'hard', 'okay', 'easy'];

    const gradeButtons = buttons.map((grade) =>
      createElement('span', {
        id: grade,
        class: ['grading-button', 'button', 'outline', grade],
        innerText: grade,
        handler: () => {
          const { vid, sid } = this._cardContext!.ajbContext!.token.card;

          void sendToBackground('gradeCard', vid, sid, grade).then(() =>
            sendToBackground('updateCardState', vid, sid),
          );
        },
      }),
    );

    this._gradeButtons.replaceChildren(...gradeButtons);
  }

  private rerender(): void {
    if (!this._cardContext) {
      return;
    }

    this.adjustMiningButtons();
    this.adjustContext();
    this.adjustDetails();

    this.setPosition();
  }

  private adjustMiningButtons(): void {
    const isNF = this.cardHasState('neverForget');
    const isBL = this.cardHasState('blacklist');

    withElement(this._mineButtons, '#never-forget-deck', (el) => {
      el.innerText = isNF ? 'Unmark as never forget' : 'Never forget';
    });
    withElement(this._mineButtons, '#blacklist-deck', (el) => {
      el.innerText = isBL ? 'Remove from blacklist' : 'Blacklist';
    });
  }

  private adjustContext(): void {
    const { card } = this._cardContext!.ajbContext!.token;
    const { vid, spelling, reading, cardState, frequencyRank, pitchAccent } = card;
    const url = `https://jpdb.io/vocabulary/${vid}/${encodeURIComponent(spelling)}/${encodeURIComponent(reading)}`;

    this._context.replaceChildren(
      createElement('div', {
        id: 'header',
        children: [
          createElement('a', {
            attributes: { href: url, target: '_blank', lang: 'ja' },
            children: [
              createElement('span', { class: 'spelling', innerText: spelling }),
              reading === spelling
                ? false
                : createElement('span', { class: 'reading', innerText: `(${reading})` }),
            ],
          }),
          createElement('div', {
            class: 'state',
            children: cardState.map((s) => createElement('span', { class: [s], innerText: s })),
          }),
        ],
      }),
      createElement('div', {
        id: 'metainfo',
        children: [
          createElement('span', { class: 'frequency-rank', innerText: `Top ${frequencyRank}` }),
          ...pitchAccent.map((pitch) => this.renderPitch(reading, pitch)),
        ],
      }),
    );
  }

  private renderPitch(reading: string, pitch: string): HTMLElement {
    if (reading.length != pitch.length - 1) {
      return createElement('span', { innerText: 'Error: invalid pitch' });
    }

    try {
      const parts = [];
      const borders = Array.from(pitch.matchAll(/L(?=H)|H(?=L)/g), (x) => x.index + 1);

      let lastBorder = 0;
      let low = pitch.startsWith('L');

      for (const border of borders) {
        parts.push(
          createElement('span', {
            class: [low ? 'low' : 'high'],
            innerText: reading.slice(lastBorder, border),
          }),
        );

        lastBorder = border;
        low = !low;
      }

      if (lastBorder != reading.length) {
        // No switch after last part
        parts.push(
          createElement('span', {
            class: [low ? 'low-final' : 'high-final'],
            innerText: reading.slice(lastBorder),
          }),
        );
      }

      return createElement('span', { class: 'pitch', children: parts });
    } catch (_e: unknown) {
      return createElement('span', { innerText: 'Error: invalid pitch' });
    }
  }

  private adjustDetails(): void {
    const { card } = this._cardContext!.ajbContext!.token;
    const { meanings } = card;

    const groupedMeanings: {
      partOfSpeech: string[];
      glosses: string[][];
      startIndex: number;
    }[] = [];
    let lastPos: string[] = [];

    for (const [index, meaning] of meanings.entries()) {
      if (
        meaning.partOfSpeech.length == lastPos.length &&
        meaning.partOfSpeech.every((p, i) => p === lastPos[i])
      ) {
        groupedMeanings[groupedMeanings.length - 1].glosses.push(meaning.glosses);

        continue;
      }

      groupedMeanings.push({
        partOfSpeech: meaning.partOfSpeech,
        glosses: [meaning.glosses],
        startIndex: index,
      });
      lastPos = meaning.partOfSpeech;
    }

    this._details.replaceChildren(
      ...groupedMeanings.flatMap(({ partOfSpeech, glosses, startIndex }) => [
        createElement('h2', {
          innerText: partOfSpeech
            .map((pos) => PARTS_OF_SPEECH[pos] ?? 'Unknown')
            .filter(Boolean)
            .join(', '),
        }),
        createElement('ol', {
          attributes: {
            start: (startIndex + 1).toString(),
          },
          children: glosses.map((g) =>
            createElement('li', {
              innerText: g.join('; '),
            }),
          ),
        }),
      ]),
    );
  }

  private setPosition(): void {
    const clamp = (value: number, min: number, max: number): number =>
      Math.min(Math.max(value, min), max);

    const { writingMode } = getComputedStyle(this._cardContext!);
    const { x, y } = this._cardContext!.getBoundingClientRect();
    const { offsetWidth: popupWidth, offsetHeight: popupHeight } = this._popup;
    const { innerWidth, innerHeight, scrollX, scrollY } = window;
    const { top, right, bottom, left } = this.getClosestClientRect(this._cardContext!, x, y);

    const wordLeft = scrollX + left;
    const wordTop = scrollY + top;
    const wordRight = scrollX + right;
    const wordBottom = scrollY + bottom;

    const leftSpace = left;
    const topSpace = top;
    const rightSpace = innerWidth - right;
    const bottomSpace = innerHeight - bottom;

    const minLeft = scrollX;
    const maxLeft = scrollX + innerWidth - popupWidth;
    const minTop = scrollY;
    const maxTop = scrollY + innerHeight - popupHeight;

    let popupLeft: number;
    let popupTop: number;

    if (writingMode.startsWith('horizontal')) {
      popupTop = clamp(bottomSpace > topSpace ? wordBottom : wordTop - popupHeight, minTop, maxTop);
      popupLeft = clamp(
        rightSpace > leftSpace ? wordLeft : wordRight - popupWidth,
        minLeft,
        maxLeft,
      );
    } else {
      popupTop = clamp(bottomSpace > topSpace ? wordTop : wordBottom - popupHeight, minTop, maxTop);
      popupLeft = clamp(
        rightSpace > leftSpace ? wordRight : wordLeft - popupWidth,
        minLeft,
        maxLeft,
      );
    }

    this._popup.style.left = `${popupLeft}px`;
    this._popup.style.top = `${popupTop}px`;
  }

  private getClosestClientRect(elem: HTMLElement, x: number, y: number): DOMRect {
    const rects = elem.getClientRects();

    if (rects.length === 1) {
      return rects[0];
    }

    // Merge client rects that are adjacent
    // This works around a Chrome issue, where sometimes, non-deterministically,
    // inline child elements will get separate client rects, even if they are on the same line.
    const { writingMode } = getComputedStyle(elem);
    const horizontal = writingMode.startsWith('horizontal');
    const mergedRects = [];

    for (const rect of rects) {
      if (mergedRects.length === 0) {
        mergedRects.push(rect);

        continue;
      }

      const prevRect: DOMRect = mergedRects[mergedRects.length - 1];

      if (horizontal) {
        if (rect.bottom === prevRect.bottom && rect.left === prevRect.right) {
          mergedRects[mergedRects.length - 1] = new DOMRect(
            prevRect.x,
            prevRect.y,
            rect.right - prevRect.left,
            prevRect.height,
          );
        } else {
          mergedRects.push(rect);
        }
      } else {
        if (rect.right === prevRect.right && rect.top === prevRect.bottom) {
          mergedRects[mergedRects.length - 1] = new DOMRect(
            prevRect.x,
            prevRect.y,
            prevRect.width,
            rect.bottom - prevRect.top,
          );
        } else {
          mergedRects.push(rect);
        }
      }
    }

    return mergedRects
      .map((rect) => ({
        rect,
        distance:
          Math.max(rect.left - x, 0, x - rect.right) ** 2 +
          Math.max(rect.top - y, 0, y - rect.bottom) ** 2,
      }))
      .reduce((a, b) => (a.distance <= b.distance ? a : b)).rect;
  }
}
