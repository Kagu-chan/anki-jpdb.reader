import { HostMeta } from '@shared/host-meta/types';
import { Registry } from '../../integration/registry';
import { AutomaticParser } from '../automatic.parser';
import { getMokuroParagraphs } from './mokuro/get-mokuro-paragraphs';

export class MokuroLegacyParser extends AutomaticParser {
  constructor(meta: HostMeta) {
    super(meta);

    for (const page of document.querySelectorAll('#pagesContainer > div')) {
      this._visibleObserver!.observe(page);
    }
  }

  protected visibleObserverOnEnter(
    elements: Element[],
    observer: IntersectionObserver,
    filter?: (node: HTMLElement | Text) => boolean,
  ): void {
    const { batchController } = Registry;

    batchController.registerNodes(elements, {
      filter,
      onEmpty: (e) => e instanceof Element && observer.unobserve(e),
      getParagraphsFn: getMokuroParagraphs,
    });

    batchController.parseBatches();
  }
}
