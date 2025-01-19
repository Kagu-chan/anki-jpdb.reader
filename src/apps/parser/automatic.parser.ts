import { HostMeta } from '@shared/host-meta/types';
import { BaseParser } from './base.parser';

export class AutomaticParser extends BaseParser {
  protected _visibleObserver: IntersectionObserver | undefined;
  protected _addedObserver: MutationObserver | undefined;

  constructor(meta: HostMeta) {
    super(meta);

    if (this._meta.parseVisibleObserver) {
      this.setupVisibleObserver();
    }

    if (this._meta.addedObserver) {
      this.setupAddedObserver();
    }

    if (this._meta.parse) {
      this.parsePage();
    }
  }

  /** Sets up a `getParseVisibleObserver (IntersectionObserver)` for the page */
  protected setupVisibleObserver(): void {
    let filter: ((node: HTMLElement | Text) => boolean) | undefined;

    if (typeof this._meta.parseVisibleObserver === 'object') {
      const obs = this._meta.parseVisibleObserver;
      const { include = '', exclude = '' } = obs;

      const isInclude = include?.length > 0;
      const isExclude = exclude?.length > 0;

      filter = (node): boolean => {
        if (node instanceof Text) {
          return true;
        }

        if (isInclude && !node.matches(include)) {
          return false;
        }

        if (isExclude && node.matches(exclude)) {
          return false;
        }

        return true;
      };
    }

    this._visibleObserver = this.getParseVisibleObserver(filter);
  }

  /**
   * Sets up a `getAddedObserver (MutationObserver)` for the page.
   *
   * If a `visibleObserver` is set, the elements that are added will be observed.
   * If not, the elements will be parsed immediately.
   */
  protected setupAddedObserver(): void {
    this._addedObserver = this.getAddedObserver(
      this._meta.addedObserver!.observeFrom,
      this._meta.addedObserver!.notifyFor,
      this._meta.addedObserver!.config,
      (nodes) => this.addedObserverCallback(nodes),
    );
  }

  /**
   * The callback to call when nodes are added in @see setupAddedObserver
   *
   * @param {HTMLElement[]} nodes The added nodes
   * @returns {void}
   */
  protected addedObserverCallback(nodes: HTMLElement[]): void {
    if (!this._visibleObserver) {
      return this.parseNodes(nodes);
    }

    nodes.forEach((node) => this._visibleObserver?.observe(node));
  }
}
