/**
 * Gets a MutationObserver that observes for added nodes. When a node is added, it is parsed.
 * Also, the callback is called with the initial nodes that match the notifyFor selector.
 *
 * If a visibleObserver is defined alongside the added observer, added elements wont get parsed, but observed for visibility first.
 *
 * Used to parse elements that are only available after a certain event or when new text is added in intervals or after interaction with the app.
 */
export type AddedObserverOptions = {
  /**
   * The root element to observe. If multiple are given, the first found will be used.
   *
   * @default 'body'
   */
  observeFrom?: string | string[];

  /**
   * Notify only for added elements matching the given selector.
   */
  notifyFor: string;

  /**
   * @see MutationObserver.observe
   * https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
   *
   * @default { childList: true, subtree: true }
   */
  config?: MutationObserverInit;
};

/**
 * Gets an IntersectionObserver that observes for elements that are visible in the viewport.
 * When an element is or becomes visible, it gets parsed.
 * When an element is or becomes invisible, any outstanding parsing gets canceled.
 *
 * Used to parse elements that may become visible at a later point in time, for example when scrolling.
 */
export type VisibleObserverOptions =
  | boolean
  | {
      /** Selector to include in the visible observer. Defauls to all */
      include?: string;
      /** Selector to exclude in the visible observer. Defaults to nothing */
      exclude?: string;
    };

export type CustomHostMeta = {
  /**
   * A host or list of hosts this configuration applies to.
   *
   * Roughly implements the functionality described here:
   * https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns
   */
  host: string | string[];

  /**
   * Determines if the page is parsed automatically on a trigger or manually.
   *
   * @default true
   */
  auto?: boolean;

  /**
   * Determines if the related parsing script should be executed in all related frames or only the main window.
   *
   * Videos often run in a separate frame, everything else probaply does not need this.
   *
   * @default false
   */
  allFrames?: boolean;

  /**
   * If `disabled`, a page is extempt from trigger parsing. This automatically applies to pages having specific automatic parsers as well.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * The entrypoint for parsing, defaults to `body`
   *
   * @default 'body'
   */
  parse?: string;

  /**
   * Optional selector to filter the elements to parse. If not set, all elements will be parsed.
   * If parseVisibleObserver is set to `true`, this will be used as a filter for the visible observer as well.
   * If parseVisibleObserver is set to `false` or not set, this will be used as a filter for the added observer.
   */
  filter?: string;

  /**
   * Optional css to inject upon first parse trigger. `word.css` will always be injected.
   */
  css?: string;

  /**
   * `true` or an object defining the behavior further to automatically parse elements becoming visible.
   */
  parseVisibleObserver?: VisibleObserverOptions;

  /**
   * Configuration object defining a MutationObserver waiting for added elements.
   * If used in junction with `parseVisibleObserver`, the `MutationObserver` will add all added elements to the created `IntersectionObserver`
   */
  addedObserver?: AddedObserverOptions;

  /**
   * Optional class to add to the document body to indicate that the parser is active and style its elements.
   */
  parserClass?: string;
};
