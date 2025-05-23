import { createElement } from '@shared/dom/create-element';
import { DOMElementBaseOptions } from '@shared/dom/types';
import { Fragment } from '../batches/types';
import { Registry } from '../integration/registry';
import { BaseTextHighlighter } from './base.text-highlighter';

export class LegacyTextHighlighter extends BaseTextHighlighter {
  public apply(): void {
    let fragmentIndex = 0;
    let curOffset = 0;
    let fragment = this.fragments[fragmentIndex];

    for (const token of this.tokens) {
      Registry.addCard(token.card);

      if (!fragment) {
        return;
      }

      // Wrap all unparsed fragments that appear before the token
      while (curOffset < token.start) {
        if (fragment.end > token.start) {
          // Only the beginning of the node is unparsed. Split it.
          this.splitFragment(this.fragments, fragmentIndex, token.start);
        }

        this.wrap(
          fragment.node,
          createElement('span', {
            class: ['jpdb-word', 'unparsed'],
            attributes: { ajb: true },
          }),
        );

        curOffset += fragment.length;
        fragment = this.fragments[++fragmentIndex];

        if (!fragment) {
          return;
        }
      }

      // Accumulate fragments until we have enough to fit the current token
      while (curOffset < token.end) {
        if (fragment.end > token.end) {
          // Only the beginning of the node is part of the token. Split it.
          this.splitFragment(this.fragments, fragmentIndex, token.end);
        }

        const classes = ['jpdb-word', ...token.card.cardState];
        const attributes: DOMElementBaseOptions['attributes'] = {
          ajb: true,
          vid: token.card.vid.toString(),
          sid: token.card.sid.toString(),
        };
        const wrapper =
          token.rubies.length > 0 && !fragment.hasRuby
            ? createElement('ruby', {
                attributes,
                class: classes,
                events: {
                  onmouseenter: (event: MouseEvent) =>
                    Registry.popupManager?.enter(event, token.sentence),
                  onmouseleave: () => Registry.popupManager?.leave(),
                  onclick: (event: MouseEvent) =>
                    Registry.popupManager?.touch(event, token.sentence),
                },
              })
            : createElement('span', {
                attributes,
                class: classes,
                events: {
                  onmouseenter: (event: MouseEvent) =>
                    Registry.popupManager?.enter(event, token.sentence),
                  onmouseleave: () => Registry.popupManager?.leave(),
                  onclick: (event: MouseEvent) =>
                    Registry.popupManager?.touch(event, token.sentence),
                },
              });

        this.wrap(fragment.node, wrapper);

        if (!fragment.hasRuby) {
          for (const ruby of token.rubies) {
            if (ruby.start >= fragment.start && ruby.end <= fragment.end) {
              // Ruby is contained in fragment
              if (ruby.start > fragment.start) {
                this.splitFragment(this.fragments, fragmentIndex, ruby.start);
                this.insertAfter(createElement('rt', { id: false }), fragment.node);

                fragment = this.fragments[++fragmentIndex];
              }

              if (ruby.end < fragment.end) {
                this.splitFragment(this.fragments, fragmentIndex, ruby.end);
                this.insertAfter(
                  createElement('rt', { innerText: ruby.text, class: 'jpdb-furi' }),
                  fragment.node,
                );

                fragment = this.fragments[++fragmentIndex];
              } else {
                this.insertAfter(
                  createElement('rt', { innerText: ruby.text, class: 'jpdb-furi' }),
                  fragment.node,
                );
              }
            }
          }
        }

        curOffset = fragment.end;
        fragment = this.fragments[++fragmentIndex];

        if (!fragment) {
          break;
        }
      }
    }

    // Wrap any left-over fragments in unparsed wrappers
    for (const fragment of this.fragments.slice(fragmentIndex)) {
      this.wrap(
        fragment.node,
        createElement('span', {
          class: ['jpdb-word', 'unparsed'],
          attributes: { ajb: true },
        }),
      );
    }
  }

  protected splitFragment(fragments: Fragment[], fragmentIndex: number, splitOffset: number): void {
    const oldFragment = fragments[fragmentIndex];
    const newNode = oldFragment.node.splitText(splitOffset - oldFragment.start);

    // Insert new fragment
    const newFragment = {
      start: splitOffset,
      end: oldFragment.end,
      length: oldFragment.end - splitOffset,
      node: newNode,
      hasRuby: oldFragment.hasRuby,
    };

    fragments.splice(fragmentIndex + 1, 0, newFragment);

    // Change endpoint of existing fragment accordingly
    oldFragment.end = splitOffset;
    oldFragment.length = splitOffset - oldFragment.start;
  }

  protected wrap(node: Node, wrapper: HTMLElement): void {
    this.insertBefore(wrapper, node);

    wrapper.append(node);
  }

  protected insertBefore(newNode: HTMLElement, referenceNode: Node): void {
    referenceNode.parentElement!.insertBefore(newNode, referenceNode);
  }

  protected insertAfter(newNode: HTMLElement, referenceNode: Node): void {
    const parent = referenceNode.parentElement!;
    const sibling = referenceNode.nextSibling;

    if (sibling) {
      parent.insertBefore(newNode, sibling);

      return;
    }

    parent.appendChild(newNode);
  }
}
