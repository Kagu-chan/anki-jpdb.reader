import { Registry } from '../../integration/registry';
import { AutomaticParser } from '../automatic.parser';
import { getMokuroParagraphs } from './mokuro/get-mokuro-paragraphs';

export class MokuroLegacyParser extends AutomaticParser {
  protected getParagraphsFn = getMokuroParagraphs;

  protected override init(): void {
    Registry.sentenceManager.disable();

    for (const page of document.querySelectorAll('#pagesContainer > div')) {
      this._visibleObserver!.observe(page);
    }
  }
}
