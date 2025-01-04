import { createElement } from '@shared/dom';
import { JPDBCard, JPDBToken } from '@shared/jpdb';
import { Fragment } from '../batches/types';
import { Registry } from '../integration/registry';
import { BaseTextHighlighter } from './base.text-highlighter';

export class TextHighlighter extends BaseTextHighlighter {
  protected _fragments: Set<Fragment>;
  protected _tokens: Set<JPDBToken>;
  protected _tokenToFragmentsMap = new Map<JPDBToken, Fragment[]>();
  protected _fragmentToTokensMap = new Map<Fragment, JPDBToken[]>();

  constructor(fragments: Fragment[], tokens: JPDBToken[]) {
    super(fragments, tokens);

    this._fragments = new Set(this.fragments);
    this._tokens = new Set(this.tokens);
  }

  public apply(): void {
    this.preprocess();

    this.patchUnparsedFragments();

    this.patchNonRubyTokens();
    this.patchContainedRubyElements();
    this.patchFragmentedRubyTokens();

    this.patchRemainingMisparses();

    if (!this._fragments.size && !this._tokens.size) {
      return;
    }
  }

  /**
   * Preprocess the data - this maps tokens and fragment relations as well as applies error correction
   */
  protected preprocess(): void {
    // Match tokens and fragments together
    this.buildMaps();

    // Split fragments that contain multiple tokens into multiple fragments (e.g. sentences)
    this.splitMultiTokenFragments();

    // Apply error correction to fragments that do not match the tokens exactly
    this.adjustUnmatchedFragments();

    // Rebuild the maps after error correction. This also sorts fragments and tokens beforehand
    this.rebuildMaps();

    // Error correction may have resulted in new fragments that need to be split (e.g. sentences behind a malformed node)
    this.splitMultiTokenFragments();
  }

  //#region Building Maps

  /**
   * Rebuild the maps between tokens and fragments
   *
   * The maps are sorted by the start position of the tokens and fragments
   * This is necessary after error correction to ensure the maps are up to date, otherwise splitted fragments may not be matched correctly
   */
  protected rebuildMaps(): void {
    this._fragments = new Set([...this._fragments].sort((a, b) => a.start - b.start));
    this._tokens = new Set([...this._tokens].sort((a, b) => a.start - b.start));

    this._fragmentToTokensMap.clear();
    this._tokenToFragmentsMap.clear();

    this.buildMaps();
  }

  /**
   * Rebuilds the maps between tokens and fragments
   */
  protected buildMaps(): void {
    this.matchTokensToFragments();
    this.matchFragmentsToTokens();
  }

  /**
   * Find all fragments that are within the token
   *
   * A token (a word) can span multiple fragments when they are splitted in the layout, especially when they contain ruby text
   */
  protected matchTokensToFragments(): void {
    this._tokens.forEach((token) => {
      this._tokenToFragmentsMap.set(token, this.findFragmentsForToken(token));
    });
  }

  /**
   * Find all fragments that are within the token
   * We need to find all fragments that are either completely inside the token or overlap with it
   *
   * @param {JPDBToken} token The token to find the fragments for
   * @returns {Fragment[]} The fragments that are within the token
   */
  protected findFragmentsForToken(token: JPDBToken): Fragment[] {
    const fragments: Fragment[] = [];

    this._fragments.forEach((fragment) => {
      if (this.isFragmentWithinToken(fragment, token)) {
        fragments.push(fragment);
      }
    });

    return fragments;
  }

  /**
   * Find all tokens that are within the fragment
   *
   * A fragment can contain multiple tokens the fragment contains multiple words, for example a whole sentence
   */
  protected matchFragmentsToTokens(): void {
    this._fragments.forEach((fragment) => {
      this._fragmentToTokensMap.set(fragment, this.findTokensForFragment(fragment));
    });
  }

  /**
   * Find all tokens that are within the fragment
   * We need to find all tokens that are either completely inside the fragment or overlap with it
   *
   * @param {Fragment} fragment The fragment to find the tokens for
   * @returns {JPDBToken[]} The tokens that are within the fragment
   */
  protected findTokensForFragment(fragment: Fragment): JPDBToken[] {
    const tokens: JPDBToken[] = [];

    this._tokens.forEach((token) => {
      if (this.isFragmentWithinToken(fragment, token)) {
        tokens.push(token);
      }
    });

    return tokens;
  }

  //#endregion Building Maps
  //#region Splitting Fragments

  /**
   * Split fragments that contain multiple tokens into multiple fragments and add them to the fragment set
   */
  protected splitMultiTokenFragments(): void {
    this.filterMap(this._fragmentToTokensMap, (tokens, _fragment) => tokens.length > 1).forEach(
      (tokens, fragment) => {
        let token: JPDBToken | undefined;

        while ((token = tokens.pop())) {
          this.cutoffTokenEnd(token, fragment);

          if (token.start < fragment.start) {
            // The token begins before the fragment - this hints to a kanji with ruby in the previous fragment
            // in this case we cancel the processing and let the previous fragment handle the token

            // because we already popped the token, we need to readd it to the tokens list
            tokens.push(token);

            return;
          }

          // We cut off the token length from the fragment and save it as a new fragment
          // this shortens the original fragment and may fix its length
          const newFragmentNode = this.splitFragmentsNode(fragment, token.start);
          const newFragment = this.insertNewFragment(newFragmentNode, token.start);

          this._fragmentToTokensMap.set(newFragment, [token]);
          this._tokenToFragmentsMap.set(token, [newFragment]);

          this.fixFragmentParameters(fragment);
        }

        if (fragment.length) {
          this.patchOrWrap(fragment);
        }

        this.dismissElements(fragment);
      },
    );
  }

  protected cutoffTokenEnd(token: JPDBToken, fragment: Fragment): void {
    // If the fragment is longer than the token (e.g. a sentence ending with a period)
    // we cut off the end and mark it as unparsed
    if (token.end < fragment.end) {
      // The fragment is longer than the token (e.g. a sentence ending with a period)
      this.patchOrWrap(this.splitFragmentsNode(fragment, token.end));

      this.fixFragmentParameters(fragment);
    }
  }

  //#endregion Splitting Fragments
  //#region Error Correction

  protected adjustUnmatchedFragments(): void {
    this.filterMap(
      this._tokenToFragmentsMap,
      (fragments, tokens) => !this.areBoundariesExactMatch(tokens, fragments),
    ).forEach((fragments, token) => {
      // An mismatch in boundaries has two common reasons:
      // 1. It is related to a misparsed kanji where the boundaries shift - we ignore those for now
      // 2. Special caracters like 。, 、 or parentheses are not included in the token

      this.adjustFragmentEnds(fragments, token);
      this.adjustFragmentStarts(fragments, token);
    });
  }

  protected adjustFragmentEnds(fragments: Fragment[], token: JPDBToken): void {
    fragments
      .filter((fragment) => this.isFragmentWithinToken(fragment, token))
      .forEach((fragment) => {
        if (fragment.end > token.end) {
          const overlap = this.splitFragmentsNode(fragment, token.end);

          this.fixFragmentParameters(fragment);
          this.insertNewFragment(overlap, token.end);
        }
      });
  }

  protected adjustFragmentStarts(fragments: Fragment[], token: JPDBToken): void {
    fragments
      .filter((fragment) => this.isFragmentWithinToken(fragment, token))
      .forEach((fragment) => {
        if (fragment.start < token.start) {
          const correctedFragmentTextNode = this.splitFragmentsNode(fragment, token.start);

          fragment.node = correctedFragmentTextNode;
          fragment.start = token.start;

          this.fixFragmentParameters(fragment);
        }
      });
  }

  //#endregion Error Correction
  //#region Patch unparsed Fragments

  /**
   * Fragments with zero tokens could not be parsed - we mark them as unparsed
   */
  protected patchUnparsedFragments(): void {
    this.filterMap(this._fragmentToTokensMap, (tokens) => !tokens.length).forEach((_, fragment) =>
      this.patchOrWrap(fragment),
    );
  }

  //#endregion Patch unparsed Fragments
  //#region Patch non ruby tokens

  /**
   * Apply tokens without rubies with fragments matching the boundaries of the token
   */
  protected patchNonRubyTokens(): void {
    this.filterMap(
      this._tokenToFragmentsMap,
      (fragments, token) => !token.rubies.length && this.areBoundariesExactMatch(token, fragments),
    ).forEach((fragments, token) =>
      fragments.forEach((fragment) => this.patchOrWrap(fragment, token)),
    );
  }

  //#endregion Patch non ruby tokens
  //#region Patch contained ruby elements

  /**
   * Apply ruby tokens which have only one fragment and the boundaries match exactly
   */
  protected patchContainedRubyElements(): void {
    this.filterMap(
      this._tokenToFragmentsMap,
      (fragments, token) =>
        fragments.length === 1 &&
        !!token.rubies.length &&
        this.areBoundariesExactMatch(token, fragments),
    ).forEach(([fragment], token) => {
      const rubyElement = this.findParent(fragment.node, 'RUBY');

      this.dismissElements(fragment, token);

      if (!rubyElement) {
        return this.applyRubyToFragment(fragment, token);
      }

      if (this.isMisparsedRuby(rubyElement, token)) {
        return this.markElementAsMisparsed(rubyElement);
      }

      this.patchElement(rubyElement, token.card);
    });
  }

  protected applyRubyToFragment(fragment: Fragment, token: JPDBToken): void {
    const newRuby = this.wrapElement(fragment.node, token.card);
    let nodeText = fragment.node.textContent!;

    for (let i = token.rubies.length - 1; i >= 0; i--) {
      const ruby = token.rubies[i];
      const rubyStart = ruby.start - fragment.start;
      const rubyEnd = ruby.end - fragment.start;

      const beforeRuby = nodeText.slice(0, rubyStart);
      const rubyText = nodeText.slice(rubyStart, rubyEnd);
      const afterRuby = nodeText.slice(rubyEnd);

      nodeText = [beforeRuby, `<ruby>${rubyText}<rt>${ruby.text}</rt></ruby>`, afterRuby].join('');
    }

    newRuby.innerHTML = nodeText;
  }

  //#endregion Patch contained ruby elements
  //#region Patch fragmented ruby tokens

  /**
   * Apply ruby tokens which span multiple fragments and the boundaries match exactly
   */
  protected patchFragmentedRubyTokens(): void {
    this.filterMap(this._tokenToFragmentsMap, (fragments, token) =>
      this.areBoundariesExactMatch(token, fragments),
    ).forEach((fragments, token) => {
      if (this.applyOnSharedParent(fragments, token)) {
        return;
      }

      fragments.forEach((fragment) => {
        const fragmentsRuby = this.findParent(fragment.node, 'RUBY');

        if (fragmentsRuby) {
          this.patchElement(fragmentsRuby, token.card);
          this.dismissElements(fragment, token);

          return;
        }

        this.patchOrWrap(fragment, token);
      });
    });
  }

  protected applyOnSharedParent(fragments: Fragment[], token: JPDBToken): boolean {
    const anyHasRuby = fragments.some((fragment) => this.findParent(fragment.node, 'RUBY'));
    const sharedParentNode = this.findSharedParent(
      fragments[0].node,
      fragments[fragments.length - 1].node,
    );

    if (sharedParentNode && anyHasRuby) {
      const clone = sharedParentNode.cloneNode(true) as HTMLElement;

      clone.querySelectorAll('rt').forEach((rt) => rt.remove());

      const cloneText = clone.textContent;
      const fragmentText = fragments.map((fragment) => fragment.node.textContent).join('');

      if (cloneText === fragmentText) {
        this.patchElement(sharedParentNode, token.card);

        fragments.forEach((fragment) => {
          this.dismissElements(fragment, token);
        });

        return true;
      }
    }

    return false;
  }

  protected findSharedParent(nodeA: Node, NodeB: Node): HTMLElement | null {
    let parent = nodeA.parentElement;

    while (parent) {
      if (parent.contains(NodeB)) {
        return parent;
      }

      parent = parent.parentElement;
    }

    return null;
  }

  //#endregion
  //#region Patch remaining misparses

  protected patchRemainingMisparses(): void {
    this._tokenToFragmentsMap.forEach((fragments, token) => {
      if (this.checkUnmatchedFragmentMisparse(token, fragments)) {
        fragments.forEach((fragment) => this.dismissElements(fragment, token));
      }
    });
  }

  protected checkUnmatchedFragmentMisparse(token: JPDBToken, fragments: Fragment[]): boolean {
    let isMisparse = false;

    // If we have a definitive ruby, we can attempt a direct match
    // If it was a misparsed ruby, we can already mark and it do not need to check those anymore
    if (token.rubies.length && fragments.some((fragment) => fragment.hasRuby)) {
      fragments.forEach((fragment) => {
        if (!fragment.hasRuby) {
          return;
        }

        const parentRuby = this.findParent(fragment.node, 'RUBY');

        isMisparse = isMisparse || (parentRuby ? this.isMisparsedRuby(parentRuby, token) : false);
      });

      if (isMisparse) {
        fragments.forEach((fragment) => {
          const rubyParent = this.findParent(fragment.node, 'RUBY');

          if (rubyParent) {
            this.markElementAsMisparsed(rubyParent);
          }

          this.markNodeAsMisparsed(fragment.node);
        });
      }
    }

    return isMisparse;
  }

  protected markNodeAsMisparsed(node: Text): void {
    const parent = node.parentElement;

    if (!parent) {
      return;
    }

    const wrapper = createElement('span', {
      class: ['jpdb-word', 'misparsed'],
      attributes: { ajb: 'true' },
    });

    parent.replaceChild(wrapper, node);
    wrapper.appendChild(node);
  }

  //#endregion Patch remaining misparses
  //#region Shared Helpers

  /**
   * Check if a fragment is within a token or overlaps with it
   *
   * @param {Fragment} fragment The fragment to check
   * @param {JPDBToken} token The token to check
   * @returns {boolean} True if the fragment is within the token or overlaps, false otherwise
   */
  protected isFragmentWithinToken(fragment: Fragment, token: JPDBToken): boolean {
    return fragment.end > token.start && fragment.start < token.end;
  }

  /**
   * Split the text of a fragment at a given offset
   * The offset is relative to the fragment and will respect the fragment boundaries
   *
   * The node of the fragment is modified and the new node is returned
   *
   * @param {Fragment} fragment The fragment to cut the end off
   * @param {number} start The start position in relation to the fragment
   * @returns {Text} The new node that was created
   */
  protected splitFragmentsNode(fragment: Fragment, start: number): Text {
    const node = fragment.node as Text;

    return node.splitText(start - fragment.start);
  }

  protected fixFragmentParameters(fragment: Fragment): void {
    fragment.length = fragment.node.data.length;
    fragment.end = fragment.start + fragment.length;
  }

  protected insertNewFragment(node: Text, start: number): Fragment {
    const length = node.data.length;

    const newFragment: Fragment = {
      node,
      start: start,
      end: start + length,
      length: length,
      hasRuby: false,
    };

    this._fragments.add(newFragment);

    return newFragment;
  }

  protected filterMap<TKey, TValue>(
    map: Map<TKey, TValue[]>,
    filter: (values: TValue[], key: TKey) => boolean,
  ): Map<TKey, TValue[]> {
    const result = new Map<TKey, TValue[]>();

    map.forEach((values, key) => {
      if (filter(values, key)) {
        result.set(key, values);
      }
    });

    return result;
  }

  protected patchOrWrap(fragment: Fragment | Text, token?: JPDBToken): HTMLElement | null {
    const isFragment = this.isFragment(fragment);
    const node = isFragment ? fragment.node : fragment;
    const fragmentsParent = isFragment ? node.parentElement : node.parentElement;

    if (!fragmentsParent) {
      return null;
    }

    if (isFragment) {
      this.dismissElements(fragment, token);
    }

    if (fragmentsParent.childNodes.length > 1) {
      return this.wrapElement(node, token?.card);
    }

    this.patchElement(fragmentsParent, token?.card);

    return fragmentsParent;
  }

  protected isFragment(element: Fragment | Text): element is Fragment {
    return 'node' in element;
  }

  protected dismissElements(fragment?: Fragment, token?: JPDBToken): void {
    if (fragment) {
      this._fragments.delete(fragment);
      this._fragmentToTokensMap.delete(fragment);
    }

    if (token) {
      this._tokens.delete(token);
      this._tokenToFragmentsMap.delete(token);
    }
  }

  protected wrapElement(node: Text, card?: JPDBCard): HTMLElement {
    const element = document.createElement('span');

    this.patchElement(element, card);

    node.parentElement?.replaceChild(element, node);
    element.appendChild(node);

    return element;
  }

  protected patchElement(element: HTMLElement, card?: JPDBCard): void {
    // do not apply the same card twice
    if (element.hasAttribute('ajb')) {
      return;
    }

    element.setAttribute('ajb', 'true');

    if (card) {
      Registry.addCard(card);

      element.classList.add('jpdb-word', ...card.cardState);

      element.setAttribute('vid', card.vid.toString());
      element.setAttribute('sid', card.sid.toString());

      element.addEventListener('mouseenter', (event: MouseEvent) => {
        Registry.popupManager?.enter(event);
      });
      element.addEventListener('mouseleave', () => {
        Registry.popupManager?.leave();
      });

      return;
    }

    element.classList.add('jpdb-word', 'unparsed');
  }

  protected areBoundariesExactMatch(
    reference: { start: number; end: number },
    targets: { start: number; end: number }[],
  ): boolean {
    return (
      reference.start === targets[0].start && reference.end === targets[targets.length - 1].end
    );
  }

  protected findParent(node: Node, tag: Uppercase<string>): HTMLElement | null {
    let parent = node.parentElement;

    while (parent && parent.tagName !== tag) {
      parent = parent.parentElement;
    }

    return parent;
  }

  protected isMisparsedRuby(rubyElement: HTMLElement, token: JPDBToken): boolean {
    const originalRubyText = Array.from(rubyElement.querySelectorAll('rt'))
      .map((rt) => rt.innerText)
      .join('');

    const cardsRubyText =
      token.card.wordWithReading?.replace(/[^[]*\[([^\]]*)\][^[]*/g, '$1') ?? '';

    return originalRubyText !== cardsRubyText;
  }

  protected markElementAsMisparsed(element: HTMLElement): void {
    if (element.hasAttribute('ajb')) {
      return;
    }

    element.classList.add('jpdb-word', 'misparsed');
    element.setAttribute('ajb', 'true');
  }

  //#endregion Shared Helpers
}
