import { Fragment } from './types';

export const splitFragment = (
  fragments: Fragment[],
  fragmentIndex: number,
  splitOffset: number,
): void => {
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
};
