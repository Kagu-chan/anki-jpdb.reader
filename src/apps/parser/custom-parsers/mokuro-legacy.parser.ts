import { HostMeta } from '@shared/host-meta/types';
import { AutomaticParser } from '../automatic.parser';
import { getMokuroParagraphs } from './mokuro/get-mokuro-paragraphs';

export class MokuroLegacyParser extends AutomaticParser {
  protected getParagraphsFn = getMokuroParagraphs;

  constructor(meta: HostMeta) {
    super(meta);

    for (const page of document.querySelectorAll('#pagesContainer > div')) {
      this._visibleObserver!.observe(page);
    }
  }
}
