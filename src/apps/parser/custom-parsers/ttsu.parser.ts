import { debug } from '@shared/debug';
import { Registry } from '../../integration/registry';
import { AutomaticParser } from '../automatic.parser';

export class TtsuParser extends AutomaticParser {
  protected _pageObserver?: MutationObserver;
  protected _chapterObserver?: IntersectionObserver;

  protected setupVisibleObserver(): void {
    debug('TtsuParser: setupVisibleObserver called');

    this._visibleObserver = this.getParseVisibleObserver();
  }

  protected visibleObserverOnEnter(elements: HTMLElement[]): void {
    const [element] = elements;
    const container = element.querySelector('.book-content-container');
    const chapters = element.querySelectorAll('[id^="ttu');

    debug(
      'TtsuParser: visibleObserverOnEnter called, container found:',
      !!container,
      'chapters found:',
      chapters.length,
      'element:',
      element,
    );

    if (container) {
      debug('TtsuParser: using pageObserver branch on container:', container);

      this._pageObserver = new MutationObserver((mutations) => {
        debug('TtsuParser: pageObserver fired, mutations:', mutations);

        Registry.sentenceManager.reset();

        this.parseNode(container);
      });

      this._pageObserver.observe(container, {
        attributes: true,
        attributeFilter: ['id'],
      });

      debug('TtsuParser: parsing container on setup:', container);

      this.parseNode(container);

      return;
    }

    debug('TtsuParser: using chapterObserver branch, chapters:', chapters);

    this.setupChapterObservers(chapters);
  }

  protected visibleObserverOnExit(): void {
    debug('TtsuParser: visibleObserverOnExit called, disconnecting observers');

    this._pageObserver?.disconnect();
    this._chapterObserver?.disconnect();
  }

  protected setupChapterObservers(chapters: NodeListOf<Element>): void {
    this._chapterObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          debug('TtsuParser: chapterObserver intersecting, parsing:', entry.target);

          this.parseNode(entry.target);

          continue;
        }

        debug('TtsuParser: chapterObserver leaving, dismissing:', entry.target);

        Registry.batchController.dismissNode(entry.target);
      }
    });

    for (const chapter of chapters) {
      this._chapterObserver.observe(chapter);
    }
  }
}
