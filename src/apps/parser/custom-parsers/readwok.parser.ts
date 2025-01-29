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
    elements.forEach((element) => {
      element.querySelectorAll('rt[style]').forEach((furi) => {
        furi.removeAttribute('style');
      });
    });

    super.visibleObserverOnEnter(elements, observer, filter);
  }
}
