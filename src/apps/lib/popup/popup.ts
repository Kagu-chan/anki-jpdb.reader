import { getConfiguration } from '@shared/configuration';
import { createElement, findElements, withElement } from '@shared/dom';
import { getStyleUrl } from '@shared/extension';
import { JPDBCard, JPDBGrade } from '@shared/jpdb';
import { onBroadcastMessage, sendToBackground } from '@shared/messages';
import { PARTS_OF_SPEECH } from './part-of-speech';
// import { PARTS_OF_SPEECH } from './part-of-speech';

export class Popup {
  /**
   * This is the root element of the popup, which is attached to the host page or iframe.
   * It manages the shadow root isolating the actual popup content.
   */
  private _root: HTMLDivElement = createElement('div', {
    id: 'ajb-popup',
    events: {
      onmousedown: (ev: MouseEvent) => ev.stopPropagation(),
      onclick: (ev: MouseEvent) => ev.stopPropagation(),
      onwheel: (ev: WheelEvent) => ev.stopPropagation(),
    },
    style: {
      all: 'initial',
      zIndex: '2147483647',
      position: 'absolute',
      top: '0',
      left: '0',
      opacity: '0',
      visibility: 'hidden',
    },
  });

  //#region Utility Accessors

  /** The user declared styles - syncronized with extension storage */
  private _customStyles: HTMLStyleElement = createElement('style');

  /** Contains the buttons to manage the card and its decks */
  private _mineButtons = createElement('section', { id: 'mining', class: ['controls'] });
  /** Contains the buttons to manage card states */
  private _gradeButtons = createElement('section', { id: 'grading', class: ['controls'] });
  /** Contains the header data - all information about a word except its meaning */
  private _context = createElement('section', { id: 'context' });
  /** Contains the various meanings of a word */
  private _details = createElement('section', { id: 'details' });

  //#endregion

  /**
   * The rendered popup content itself
   */
  private _popup: HTMLDivElement = createElement('div', {
    class: ['popup'],
    // events: {
    //   onmouseenter: () => this.startHover(),
    //   onmouseleave: () => this.stopHover(),
    //   keydown: (ev: KeyboardEvent) => {
    //     if (ev.key === 'Escape' && this._isVisible) {
    //       this.processHide();
    //     }
    //   },
    // },
    children: [this._mineButtons, this._gradeButtons, this._context, this._details],
  });

  private _hidePopupAutomatically: boolean;
  private _hidePopupDelay: number;
  private _disableFadeAnimation: boolean;
  private _useTwoPointGrading: boolean;

  private _miningDeck?: string;
  private _neverForgetDeck?: string;
  private _blacklistDeck?: string;

  // private _hideTimer?: NodeJS.Timeout;
  // private _isVisible = false;
  // private _isHover = false;

  private _cardContext?: HTMLElement;
  //

  constructor() {
    this.renderNodes();

    onBroadcastMessage('cardStateUpdated', () => this.rerender());
    onBroadcastMessage('configurationUpdated', () => this.applyConfiguration(), true);
  }

  public show(_context: HTMLElement): void {
    this._cardContext = _context;

    this.updateParentElement();
    this.rerender();
    this.setPosition();

    Object.assign<CSSStyleDeclaration, Partial<CSSStyleDeclaration>>(this._root.style, {
      transition: this._disableFadeAnimation ? 'none' : 'opacity 60ms ease-in, visibility 60ms',
      opacity: '1',
      visibility: 'visible',
    });
  }

  public hide(): void {
    Object.assign<CSSStyleDeclaration, Partial<CSSStyleDeclaration>>(this._root.style, {
      transition: this._disableFadeAnimation ? 'none' : 'opacity 200ms ease-in, visibility 20ms',
      opacity: '0',
      visibility: 'hidden',
    });
  }

  public disablePointerEvents(): void {
    this._root.style.pointerEvents = 'none';
    this._root.style.userSelect = 'none';
  }

  public enablePointerEvents(): void {
    this._root.style.pointerEvents = '';
    this._root.style.userSelect = '';
  }

  //#region Configuration

  private async applyConfiguration(): Promise<void> {
    this._hidePopupAutomatically = await getConfiguration('hidePopupAutomatically');
    this._hidePopupDelay = await getConfiguration('hidePopupDelay');
    this._disableFadeAnimation = await getConfiguration('disableFadeAnimation');
    this._useTwoPointGrading = await getConfiguration('jpdbUseTwoGrades');

    this._miningDeck = await getConfiguration('jpdbMiningDeck');
    this._neverForgetDeck = await getConfiguration('jpdbNeverForgetDeck');
    this._blacklistDeck = await getConfiguration('jpdbBlacklistDeck');

    this._customStyles.textContent = await getConfiguration('customPopupCSS', true);

    this.updateMiningButtons();
    this.updateGradingButtons();
  }

  //#endregion
  //#region Install the popup

  /**
   * Installs all components and initializes the shadow root
   */
  private renderNodes(): void {
    const shadowRoot = this._root.attachShadow({ mode: 'closed' });

    shadowRoot.append(
      createElement('link', { attributes: { rel: 'stylesheet', href: getStyleUrl('popup') } }),
      this._customStyles,
      this._popup,
    );
  }

  private updateParentElement(): void {
    const parentElement = this.getParentElement();

    if (!this._root.parentElement?.isSameNode(parentElement)) {
      parentElement.appendChild(this._root);
    }
  }

  private getParentElement(): HTMLElement {
    const fullscreenVideoElement = this.getFullscreenVideoElement();

    if (fullscreenVideoElement?.parentElement) {
      return this.findElementForFullscreenVideoDisplay(fullscreenVideoElement);
    }

    return document.body;
  }

  private getFullscreenVideoElement(): HTMLElement | undefined {
    if (!document.fullscreenElement) {
      return;
    }

    return findElements('video').find((videoElement) =>
      document.fullscreenElement!.contains(videoElement),
    );
  }

  private findElementForFullscreenVideoDisplay(videoElement: HTMLElement): HTMLElement {
    let currentNode: HTMLElement | null = videoElement.parentElement;
    let chosenNode: HTMLElement | undefined;

    const testNode = document.createElement('div');

    testNode.style.position = 'absolute';
    testNode.style.zIndex = '2147483647';
    testNode.innerHTML = '&nbsp;'; // The node needs to take up some space to perform test clicks

    while (currentNode && !currentNode.isSameNode(document.body.parentElement)) {
      const rect = currentNode.getBoundingClientRect();

      if (
        rect.height > 0 &&
        (chosenNode === undefined || rect.height >= chosenNode.getBoundingClientRect().height) &&
        this.elementIsClickableInsideContainer(currentNode, testNode)
      ) {
        chosenNode = currentNode;

        break;
      }

      currentNode = currentNode.parentElement;
    }

    return chosenNode ?? document.body;
  }

  private elementIsClickableInsideContainer(container: HTMLElement, element: HTMLElement): boolean {
    container.appendChild(element);

    const rect = element.getBoundingClientRect();
    const clickedElement = document.elementFromPoint(rect.x, rect.y);
    const clickable = element.isSameNode(clickedElement) || element.contains(clickedElement);

    element.remove();

    return clickable;
  }

  //#endregion
  //#region Position the popup

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

    this._root.style.transform = `translate(${popupLeft}px, ${popupTop}px)`;
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

  //#endregion
  //#region Button Renderer

  private updateMiningButtons(): void {
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

    this._mineButtons.replaceChildren();

    this.addMiningButton(this._miningDeck, 'mining', 'Add', () =>
      performDeckAction('add', 'mining'),
    );

    this.addMiningButton(this._neverForgetDeck, 'never-forget', undefined, () =>
      performFlaggedDeckAction('neverForget'),
    );
    this.addMiningButton(this._blacklistDeck, 'blacklist', undefined, () =>
      performFlaggedDeckAction('blacklist'),
    );
  }

  private addMiningButton(
    deck: string | undefined,
    id: string,
    text?: string,
    handler?: () => void,
  ): void {
    if (!deck?.length) {
      return;
    }

    this._mineButtons.appendChild(
      createElement('a', {
        id: `${id}-deck`,
        class: ['outline', id],
        innerText: text,
        handler,
      }),
    );
  }

  private updateGradingButtons(): void {
    const buttons: JPDBGrade[] = this._useTwoPointGrading
      ? ['fail', 'pass']
      : ['nothing', 'something', 'hard', 'okay', 'easy'];

    const gradeButtons = buttons.map((grade) =>
      createElement('a', {
        id: grade,
        class: ['outline', grade],
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

  //#endregion
  //#region Card Utils

  private cardHasState(state: 'neverForget' | 'blacklist'): boolean {
    const { cardState } = this._cardContext!.ajbContext!.token.card;
    const lookupState = state === 'neverForget' ? 'never-forget' : 'blacklisted';

    return cardState.includes(lookupState);
  }

  //#endregion
  //#region On showing a popup

  private rerender(): void {
    const { card } = this._cardContext!.ajbContext!.token;

    this.adjustMiningButtons();
    this.adjustContext(card);
    this.adjustDetails(card);
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

  private adjustContext(card: JPDBCard): void {
    this._context.replaceChildren(
      createElement('div', {
        id: 'header',
        class: 'subsection',
        children: [this.getReadingBlock(card), this.getCardStateBlock(card)],
      }),
      createElement('div', {
        id: 'meta',
        class: 'subsection',
        children: [this.getPitchAccentBlock(card), this.getFrequencyBlock(card)],
      }),
    );
  }

  private getReadingBlock(card: JPDBCard): HTMLAnchorElement {
    const { vid, spelling, reading, wordWithReading } = card;
    const url = `https://jpdb.io/vocabulary/${vid}/${encodeURIComponent(spelling)}/${encodeURIComponent(reading)}`;

    return createElement('a', {
      id: 'link',
      attributes: { href: url, target: '_blank', lang: 'ja' },
      innerHTML: this.convertToRuby(wordWithReading ?? spelling),
    });
  }

  private convertToRuby(wordWithReading: string): string {
    if (!wordWithReading.includes('[')) {
      return wordWithReading;
    }

    return wordWithReading.replace(
      /([^\u3040-\u309F\u30A0-\u30FF]+)\[(.+?)\]/g,
      (_: string, nonKana: string, reading: string) => {
        return `<ruby>${nonKana}<rt>${reading}</rt></ruby>`;
      },
    );
  }

  private getCardStateBlock(card: JPDBCard): HTMLDivElement {
    const { cardState } = card;

    return createElement('div', {
      id: 'state',
      children: [...cardState, ...cardState].map((s) =>
        createElement('span', { class: [s], innerText: s }),
      ),
    });
  }

  private getPitchAccentBlock(card: JPDBCard): HTMLDivElement {
    const { reading, pitchAccent } = card;

    return createElement('div', {
      id: 'pitch-accent',
      children: pitchAccent.map((pitch) => this.renderPitch(reading, pitch)),
    });
  }

  private getFrequencyBlock(card: JPDBCard): HTMLDivElement {
    const { frequencyRank } = card;

    return createElement('div', {
      id: 'frequency',
      innerText: `Top ${frequencyRank}`,
    });
  }

  private renderPitch(reading: string, pitch: string): HTMLSpanElement {
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

  private adjustDetails(card: JPDBCard): void {
    const groupedMeanings = this.getGroupedMeanings(card);

    this._details.replaceChildren(
      ...groupedMeanings.flatMap(({ partOfSpeech, glosses, startIndex }) => [
        createElement('div', {
          class: 'pos',
          children: partOfSpeech
            .map((pos) => PARTS_OF_SPEECH[pos] ?? 'Unknown')
            .filter(Boolean)
            .map((pos) => createElement('span', { innerText: pos })),
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

  private getGroupedMeanings(card: JPDBCard): {
    partOfSpeech: string[];
    glosses: string[][];
    startIndex: number;
  }[] {
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

    return groupedMeanings;
  }

  //#endregion
}
