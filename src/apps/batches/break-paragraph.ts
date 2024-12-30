import { Fragment, Paragraph } from './types';

export const breakParagraph = (paragraphs: Paragraph[], fragments: Fragment[]): void => {
  // Remove fragments from the end that are just whitespace
  // (the ones from the start have already been ignored)
  let end = fragments.length - 1;

  for (; end >= 0; end--) {
    if (fragments[end].node.data.trim().length > 0) {
      break;
    }
  }

  const trimmedFragments = fragments.slice(0, end + 1);

  if (trimmedFragments.length) {
    paragraphs.push(trimmedFragments);
  }
};
