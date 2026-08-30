import { JPDBToken } from '@shared/jpdb/types';
import { applyTokens } from '../../batches/apply-tokens';
import { Paragraph } from '../../batches/types';
import { Registry } from '../../integration/registry';
import { AutomaticParser } from '../automatic.parser';
import { getMokuroParagraphs } from './mokuro/get-mokuro-paragraphs';

class MokuroMangaPanel {
  private _panelObserver: MutationObserver;

  private _debounceTimeout: NodeJS.Timeout | undefined;
  private _debounceTime = 500;
  private _currentId = 0;

  private _pages = new Set<HTMLElement>();

  constructor(private _panel: HTMLElement) {
    this.setupPanelObserver();

    this.triggerParse();
  }

  public destroy(): void {
    this.cancelParse();

    this._panelObserver.disconnect();
  }

  /**
   * Mokuro fully replaces the panel's content (page image + text boxes) with fresh elements on
   * every page turn instead of mutating them in place, while `this._panel` itself stays mounted -
   * so a childList observer on the panel is what reliably signals a page change. This must stay
   * non-subtree: our own highlighting mutates nodes nested inside the page divs (never the
   * panel's own child list), so observing the subtree would also fire on our own highlighting
   * writes and cancel/restart an in-flight parse against itself.
   */
  private setupPanelObserver(): void {
    this._panelObserver = new MutationObserver(() => {
      this._currentId++;

      this.triggerParse();
    });

    this._panelObserver.observe(this._panel, {
      childList: true,
      subtree: false,
    });
  }

  /**
   * This is a simple debouncing mechanism to avoid parsing the page multiple times
   * The flow is as follows:
   * 1. The page changes
   * 2. The observer triggers
   * 3. The trigger function is called
   * 4. The trigger function checks if the last parse attempt was less than this._debounceTime MS ago
   * 5. If it was, the current parse attempt is cancelled and a new one is scheduled
   * 6. If it wasn't, the current parse attempt is permitted
   * This allows the user to navigate to another page without triggering a parse attempt
   */
  private triggerParse(): void {
    if (this._debounceTimeout) {
      clearTimeout(this._debounceTimeout);

      this.cancelParse();

      this._debounceTimeout = setTimeout(() => {
        this._debounceTimeout = undefined;

        this.parse();
      }, this._debounceTime);

      return;
    }

    this.parse();

    this._debounceTimeout = setTimeout(() => {
      this._debounceTimeout = undefined;
    }, this._debounceTime);
  }

  private cancelParse(): void {
    this._pages.forEach((page) => {
      Registry.batchController.dismissNode(page);

      this._pages.delete(page);
    });
  }

  private parse(): void {
    this._panel.querySelectorAll<HTMLElement>(':scope > div').forEach((page) => {
      if (this._pages.has(page)) {
        return;
      }

      const currentId = this._currentId;

      this._pages.add(page);
      Registry.batchController.registerNode(page, {
        // We create fragments manually, since mokuro splits each line's text across multiple
        // nested elements instead of a single text node per paragraph
        getParagraphsFn: getMokuroParagraphs,
        // A page turn replaces the panel content while a parse is still in flight, so we track
        // which page-change cycle we are on and don't apply stale tokens to the wrong page
        applyFn: (paragraph: Paragraph, tokens: JPDBToken[]) => {
          if (currentId === this._currentId) {
            applyTokens(paragraph, tokens);
          }
        },
      });
    });

    Registry.batchController.parseBatches(() => this._pages.clear());
  }
}

/**
 * Mokuro only adds or removes one element we can properly observe, which is the manga panel.
 * The manga panel contains everything we need to read text from the page, but is replaced
 * wholesale on every page turn, so a childList observer on it is what signals a page change.
 *
 * For this the `MokuroParser` serves as a controller instance for `MokuroMangaPanel` instances,
 * of which there should theoretically only be one.
 */
export class MokuroParser extends AutomaticParser {
  private _mangaPanels = new Map<HTMLElement, MokuroMangaPanel>();
  private _observedElements = new Set<HTMLElement>();

  protected override init(): void {
    Registry.sentenceManager.disable();
  }

  /**
   * @override we do not need a complex filter for the visible observer
   */
  protected setupVisibleObserver(): void {
    this._visibleObserver = this.getParseVisibleObserver();
  }

  /**
   * Visible elements should always be manga panels, so we convert them to instances of `MokuroMangaPanel`
   *
   * @param {HTMLElement[]} elements The manga panels that were added
   */
  protected visibleObserverOnEnter(elements: HTMLElement[]): void {
    for (const element of elements) {
      this._mangaPanels.set(element, new MokuroMangaPanel(element));
    }

    this.installAppStyles();
  }

  /**
   * Manga panels are removed when the manga is closed, so we destroy the instances of `MokuroMangaPanel`
   * This does not always happen, sometimes the page just reloads. In that case we do not care at all...
   *
   * @param {HTMLElement[]} elements The exited manga panels
   */
  protected visibleObserverOnExit(elements: HTMLElement[]): void {
    for (const element of elements) {
      this._mangaPanels.get(element)?.destroy();
      this._mangaPanels.delete(element);
    }
  }

  /**
   * Added elements are always manga panels, so we observe them with the visible observer
   * However, as Mokuro reuses a lot of elements and removes them just to add later, we keep track of what we already encountered
   *
   * @param {HTMLElement[]} elements The manga panels that were added
   */
  protected addedObserverCallback(elements: HTMLElement[]): void {
    for (const element of elements) {
      if (this._observedElements.has(element)) {
        continue;
      }

      this._visibleObserver?.observe(element);
      this._observedElements.add(element);
    }
  }
}
