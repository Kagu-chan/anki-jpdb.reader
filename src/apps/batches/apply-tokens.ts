import { DOMElementBaseOptions, createElement } from '@shared/dom';
import { JPDBToken } from '@shared/jpdb';
import { Registry } from '../integration/registry';
import { Fragment } from './types';

function splitFragment(fragments: Fragment[], fragmentIndex: number, splitOffset: number): void {
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

function insertBefore(newNode: HTMLElement, referenceNode: Node): void {
  referenceNode.parentElement!.insertBefore(newNode, referenceNode);
}

function insertAfter(newNode: HTMLElement, referenceNode: Node): void {
  const parent = referenceNode.parentElement!;
  const sibling = referenceNode.nextSibling;

  if (sibling) {
    parent.insertBefore(newNode, sibling);

    return;
  }

  parent.appendChild(newNode);
}

function wrap(node: Node, wrapper: HTMLElement): void {
  insertBefore(wrapper, node);

  wrapper.append(node);
}

export const applyTokens = (fragments: Fragment[], tokens: JPDBToken[]): void => {
  let fragmentIndex = 0;
  let curOffset = 0;
  let fragment = fragments[fragmentIndex];

  for (const token of tokens) {
    Registry.addCard(token.card);

    if (!fragment) {
      return;
    }

    // Wrap all unparsed fragments that appear before the token
    while (curOffset < token.start) {
      if (fragment.end > token.start) {
        // Only the beginning of the node is unparsed. Split it.
        splitFragment(fragments, fragmentIndex, token.start);
      }

      wrap(
        fragment.node,
        createElement('span', {
          class: ['jpdb-word', 'unparsed'],
          attributes: { ajb: true },
        }),
      );

      curOffset += fragment.length;
      fragment = fragments[++fragmentIndex];

      if (!fragment) {
        return;
      }
    }

    // Accumulate fragments until we have enough to fit the current token
    while (curOffset < token.end) {
      if (fragment.end > token.end) {
        // Only the beginning of the node is part of the token. Split it.
        splitFragment(fragments, fragmentIndex, token.end);
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
                onmouseenter: (event: MouseEvent) => Registry.popupManager?.enter(event),
                onmouseleave: () => Registry.popupManager?.leave(),
              },
            })
          : createElement('span', {
              attributes,
              class: classes,
              events: {
                onmouseenter: (event: MouseEvent) => Registry.popupManager?.enter(event),
                onmouseleave: () => Registry.popupManager?.leave(),
              },
            });

      wrap(fragment.node, wrapper);

      if (!fragment.hasRuby) {
        for (const ruby of token.rubies) {
          if (ruby.start >= fragment.start && ruby.end <= fragment.end) {
            // Ruby is contained in fragment
            if (ruby.start > fragment.start) {
              splitFragment(fragments, fragmentIndex, ruby.start);
              insertAfter(createElement('rt', { id: false }), fragment.node);

              fragment = fragment = fragments[++fragmentIndex];
            }

            if (ruby.end < fragment.end) {
              splitFragment(fragments, fragmentIndex, ruby.end);
              insertAfter(
                createElement('rt', { innerText: ruby.text, class: 'jpdb-furi' }),
                fragment.node,
              );

              fragment = fragment = fragments[++fragmentIndex];
            } else {
              insertAfter(
                createElement('rt', { innerText: ruby.text, class: 'jpdb-furi' }),
                fragment.node,
              );
            }
          }
        }
      }

      curOffset = fragment.end;
      fragment = fragments[++fragmentIndex];

      if (!fragment) {
        break;
      }
    }
  }

  // Wrap any left-over fragments in unparsed wrappers
  for (const fragment of fragments.slice(fragmentIndex)) {
    wrap(
      fragment.node,
      createElement('span', {
        class: ['jpdb-word', 'unparsed'],
        attributes: { ajb: true },
      }),
    );
  }
};
