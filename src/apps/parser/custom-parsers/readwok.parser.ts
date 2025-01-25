import { applyTokens } from '../../batches/apply-tokens';
import { Registry } from '../../integration/registry';
import { AutomaticParser } from '../automatic.parser';

export class ReadwokParser extends AutomaticParser {
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
      applyFn: (fragments, tokens) => {
        applyTokens(fragments, tokens);

        elements.forEach((element) => {
          element.querySelectorAll('.jpdb-furi[style]').forEach((furi) => {
            furi.removeAttribute('style');
          });
        });
      },
    });

    batchController.parseBatches();
  }
}
