import { HostMeta } from '@shared/host-meta/types';
import { Registry } from '../integration/registry';

export abstract class BaseParser {
  /** The root element to parse */
  protected get root(): HTMLElement | null {
    const { parse } = this._meta;

    return parse ? document.querySelector<HTMLElement>(parse) : document.body;
  }

  /** @param {HostMeta} _meta The host meta */
  constructor(protected _meta: HostMeta) {}

  /**
   * Parse the currently selected text
   *
   * @returns {void}
   */
  protected parseSelection(): void {
    const selection = window.getSelection()!;
    const range = selection.getRangeAt(0);

    this.parseNode(range.commonAncestorContainer, (node) => range.intersectsNode(node));
  }

  /**
   * Parse the entire page based on the specified root element
   *
   * @returns {void}
   */
  protected parsePage(): void {
    const { root } = this;

    if (!root) {
      return;
    }

    this.parseNode(root);
  }

  /**
   * Parse a given node
   *
   * @param {Node | Element} node A Node or Element to parse
   * @param {(node: Node | Element) => boolean} filter A filter for the nodes childnodes. Childnodes that do not pass the filter will not be parsed
   */
  protected parseNode(node: Node | Element, filter?: (node: Node | Element) => boolean): void {
    this.parseNodes([node], filter);
  }

  /**
   * Parse a list of nodes
   *
   * @param {(Node | Element)[]} nodes A list of nodes to parse
   * @param {(node: Node | Element) => boolean} filter A filter for the nodes childnodes. Childnodes that do not pass the filter will not be parsed
   */
  protected parseNodes(
    nodes: (Node | Element)[],
    filter?: (node: Node | Element) => boolean,
  ): void {
    const { batchController } = Registry;

    batchController.registerNodes(nodes, { filter });
    batchController.parseBatches();
  }

  /**
   * Gets a MutationObserver that observes for added nodes. When a node is added, the callback is called with the added nodes.
   * Also, the callback is called with the initial nodes that match the notifyFor selector.
   *
   * Used to parse elements that are only available after a certain event or when new text is added in intervals.
   *
   * @param {string | string[]} observeFrom The root element to observe from. If an array is provided, the first element that matches is used.
   * @param {string} notifyFor The selector to match the added nodes against
   * @param {MutationObserverInit} config The mutation observer configuration
   * @param {(nodes: HTMLElement[]) => void} callback The callback to call when nodes are added.
   * @returns {MutationObserver}
   */
  protected getAddedObserver(
    observeFrom: string | string[],
    notifyFor: string,
    config: MutationObserverInit,
    callback: (nodes: HTMLElement[]) => void,
  ): MutationObserver {
    const observeTargets = Array.isArray(observeFrom) ? observeFrom : [observeFrom];
    let root: HTMLElement | null | undefined;

    while (observeTargets.length && !root) {
      root = document.querySelector<HTMLElement>(observeTargets.shift()!);
    }
    const initialNodes = Array.from<HTMLElement>(root?.querySelectorAll(notifyFor) ?? []);

    if (initialNodes.length) {
      callback(initialNodes);
    }

    const observer = new MutationObserver((mutations) => {
      const nodes = mutations
        .filter((mutation) => mutation.type === 'childList')
        .map((mutation) => Array.from(mutation.addedNodes))
        .flat()
        .filter((node) => {
          if (node instanceof HTMLElement) {
            return node.matches(notifyFor);
          }

          return false;
        }) as HTMLElement[];

      if (nodes.length) {
        callback(nodes);
      }
    });

    if (root) {
      observer.observe(root, config);
    }

    return observer;
  }

  /**
   * Gets an IntersectionObserver that observes for elements that are visible in the viewport.
   * When an element is visible, the onEnter callback is called with the visible elements.
   * When an element is not visible, the onExit callback is called with the not visible elements.
   *
   * Used to parse elements that may become visible at a later point in time, for example when scrolling.
   * Unlike the getParseVisibleObserver method, this method does not parse the visible elements, only notifies when they are visible.
   *
   * @param {(elements: Element[]) => void} onEnter The callback to call when elements are visible
   * @param {(elements: Element[]) => void} onExit The callback to call when elements are not visible
   * @returns {IntersectionObserver}
   */
  protected getVisibleObserver(
    onEnter: (elements: Element[]) => void,
    onExit: (elements: Element[]) => void,
  ): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => {
        const withItems = (intersecting: boolean, cb: (elements: Element[]) => void): void => {
          const elements = entries
            .filter((entry) => entry.isIntersecting === intersecting)
            .map((entry) => entry.target);

          if (elements.length) {
            cb(elements);
          }
        };

        withItems(false, onExit);
        withItems(true, onEnter);
      },
      {
        rootMargin: '50% 50% 50% 50%',
      },
    );
  }

  /**
   * Gets an IntersectionObserver that observes for elements that become visible in the viewport and parses them.
   *
   * Used to parse elements that may become visible at a later point in time, for example when scrolling.
   * Unlike the getVisibleObserver method, this method also parses the visible elements.
   *
   * @param {(node: HTMLElement | Text) => boolean} filter A filter for the now visible nodes childnodes. Childnodes that do not pass the filter will not be parsed
   * @returns {IntersectionObserver}
   */
  protected getParseVisibleObserver(
    filter?: (node: HTMLElement | Text) => boolean,
  ): IntersectionObserver {
    const observer = this.getVisibleObserver(
      (elements) => this.visibleObserverOnEnter(elements, observer, filter),
      (elements) => this.visibleObserverOnExit(elements, observer),
    );

    return observer;
  }

  /**
   * Called when an item becomes visible in the viewport
   * Used as callback for the `getParseVisibleObserver` method
   *
   * Registers the items in the batch controller and parses them
   *
   * @param {Element[]} elements The element changes
   * @param {IntersectionObserver} observer The observer instance
   * @param {(node: HTMLElement | Text) => boolean} filter A filter function to filter the childnodes of the elements
   */
  protected visibleObserverOnEnter(
    elements: Element[],
    observer: IntersectionObserver,
    filter?: (node: HTMLElement | Text) => boolean,
  ): void {
    const { batchController } = Registry;

    batchController.registerNodes(elements, {
      filter,
      onEmpty: (e) => e instanceof Element && observer.unobserve(e),
    });

    batchController.parseBatches();
  }

  /**
   * Called when an item is no longer visible in the viewport
   * Used as callback for the `getParseVisibleObserver` method
   *
   * Dismisses the items from the batch controller
   *
   * @param {Element[]} elements The element changes
   * @param {IntersectionObserver} _observer The observer instance
   */
  protected visibleObserverOnExit(elements: Element[], _observer: IntersectionObserver): void {
    const { batchController } = Registry;

    elements.forEach((node) => batchController.dismissNode(node));
  }
}
