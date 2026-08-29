import { Fragment, Paragraph } from '../../../batches/types';

export const getMokuroParagraphs = (page: HTMLElement): Paragraph[] => {
  return [...page.querySelectorAll('.textBox')].map((box) => {
    const fragments: Fragment[] = [];
    let offset = 0;

    // Mokuro wraps each visual line in its own text node (nested inside a `.ocr-line` span),
    // interspersed with empty Svelte anchor comments - walk text nodes directly instead of
    // assuming a single text node per paragraph, so both are naturally skipped/collected.
    const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    let text: Text | null;

    while ((text = walker.nextNode() as Text | null)) {
      if (!text.data.length) {
        continue;
      }

      text.data = text.data
        .replaceAll('．．．', '…')
        .replaceAll('．．', '…')
        .replaceAll('！！', '‼')
        .replaceAll('！？', '⁉');

      const start = offset;
      const length = text.length;
      const end = (offset += length);

      fragments.push({
        node: text,
        start,
        end,
        length,
        hasRuby: false,
      });
    }

    return fragments;
  });
};
