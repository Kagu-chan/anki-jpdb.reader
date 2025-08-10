import { Registry } from '../../integration/registry';
import { AutomaticParser } from '../automatic.parser';

export class TtsuParser extends AutomaticParser {
  protected _pageObserver?: MutationObserver;
  protected _chapterObserver?: IntersectionObserver;

  protected setupVisibleObserver(): void {
    this._visibleObserver = this.getParseVisibleObserver();
  }

  protected visibleObserverOnEnter(elements: HTMLElement[]): void {
    const [element] = elements;
    const container = element.querySelector('.book-content-container');
    const chapters = element.querySelectorAll('[id^="ttu');

    if (container) {
      this._pageObserver = new MutationObserver(() => {
        Registry.sentenceManager.reset();

        this.parseNode(container);
      });

      this._pageObserver.observe(container, {
        attributes: true,
        attributeFilter: ['id'],
      });

      return;
    }

    this.setupChapterObservers(chapters);
  }

  protected visibleObserverOnExit(): void {
    this._pageObserver?.disconnect();
    this._chapterObserver?.disconnect();
  }

  protected setupChapterObservers(chapters: NodeListOf<Element>): void {
    this._chapterObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.parseNode(entry.target);

          continue;
        }

        Registry.batchController.dismissNode(entry.target);
      }
    });

    for (const chapter of chapters) {
      this._chapterObserver.observe(chapter);
    }
  }
}
