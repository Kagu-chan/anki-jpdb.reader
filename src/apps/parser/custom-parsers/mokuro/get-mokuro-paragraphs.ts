import { Paragraph } from '../../../batches/types';

export const getMokuroParagraphs = (page: HTMLElement): Paragraph[] => {
  return [...page.querySelectorAll('.textBox')].map((box) => {
    const fragments = [];
    let offset = 0;

    for (const p of box.children) {
      if (p.tagName !== 'P') {
        continue;
      }

      const text = p.firstChild as Text;

      if (!text?.data?.length) {
        continue;
      }

      text.data = text.data
        .replaceAll('．．．', '…')
        .replaceAll('．．', '…')
        .replaceAll('！！', '‼')
        .replaceAll('！？', '“⁉');

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
