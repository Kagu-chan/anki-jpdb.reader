import { AutomaticParser } from '../automatic.parser';

export class ExStaticParser extends AutomaticParser {
  /**
   * Gets a MutationObserver that observes for added nodes. When a node is added, the callback is called with the added nodes.
   * Also, the callback is called with the initial nodes that match the notifyFor selector.
   *
   * Used to parse elements that are only available after a certain event or when new text is added in intervals.
   *
   * @param {string | string[]} observeFrom The root element to observe from. If an array is provided, the first element that matches is used.
   * @param {string} notifyFor The selector to match the added nodes against
   * @param {string} checkNested If added elements match `checkNested`, check if they contain nested elements matching the `notifyFor` selector.
   * @param {MutationObserverInit} config The mutation observer configuration
   * @param {(nodes: HTMLElement[]) => void} onAdded The callback to call when nodes are added.
   * @returns {MutationObserver}
   */
  protected getAddedObserver(
    observeFrom: string,
    notifyFor: string,
    checkNested: string | undefined,
    config: MutationObserverInit,
    onAdded: (nodes: HTMLElement[]) => void,
    onRemoved: (nodes: HTMLElement[]) => void,
  ): MutationObserver {
    const observer = new MutationObserver((mutations) => {
      const addedNodes = mutations
        .filter((mutation) => mutation.type === 'childList')
        .map((mutation) => Array.from(mutation.addedNodes))
        .flat()
        .filter((node) => {
          if (node instanceof HTMLElement) {
            return node.matches(notifyFor);
          }

          return false;
        }) as HTMLElement[];

      if (addedNodes.length) {
        onAdded(addedNodes);
      }

      const removedNodes = mutations
        .filter((mutation) => mutation.type === 'childList')
        .map((mutation) => Array.from(mutation.removedNodes))
        .flat()
        .filter((node) => {
          if (node instanceof HTMLElement) {
            return node.matches(notifyFor);
          }

          return false;
        }) as HTMLElement[];

      if (removedNodes.length) {
        onRemoved(removedNodes);
      }
    });

    setTimeout(() => {
      const observeTargets: string[] = Array.isArray(observeFrom) ? observeFrom : [observeFrom];
      let root: HTMLElement | null | undefined;

      while (observeTargets.length && !root) {
        root = document.querySelector<HTMLElement>(observeTargets.shift()!);
      }
      const initialNodes = Array.from<HTMLElement>(root?.querySelectorAll(notifyFor) ?? []);

      if (initialNodes.length) {
        onAdded(initialNodes);

        this.watchForNodeRemove(initialNodes, onRemoved);
      }

      if (root) {
        observer.observe(root, config);
      }
    }, 2000);

    return observer;
  }
}
