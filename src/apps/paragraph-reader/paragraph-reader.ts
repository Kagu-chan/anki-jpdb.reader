import { DisplayCategory, Fragment, Paragraph } from '../batches/types';
import { BaseParagraphReader } from './base.paragraph-reader';

export class ParagraphReader extends BaseParagraphReader {
  public read(): Paragraph[] {
    const fragments: Fragment[] = [];
    const paragraphs: Paragraph[] = [];

    this.recurse(paragraphs, fragments, 0, 0, this.node, false, this.filter);

    if (!paragraphs.length && fragments.length) {
      paragraphs.push(fragments);
    }

    return paragraphs;
  }

  protected recurse(
    paragraphs: Paragraph[],
    fragments: Fragment[],
    offset: number,
    byteLen: number,
    node: Element | Node,
    hasRuby: boolean,
    filter?: (node: Element | Node) => boolean,
  ): [number, number] {
    if (node instanceof Element && node.hasAttribute('ajb')) {
      return [offset, byteLen];
    }

    const display = this.displayCategory(node);
    const reset = (): void => {
      [offset, byteLen] = this.breakParagraph(paragraphs, fragments);

      fragments.length = 0;
    };
    const breakIfBlock = (): void => {
      if (display === 'block') {
        reset();
      }
    };
    const breakIfOverflow = (): void => {
      if (byteLen > 15000) {
        reset();
      }
    };

    breakIfBlock();

    if (display === 'none' || display === 'ruby-text' || filter?.(node) === false) {
      return [offset, byteLen];
    }

    if (display === 'text') {
      breakIfOverflow();

      return this.pushText(fragments, offset, byteLen, node as Text | CDATASection, hasRuby);
    }

    if (display === 'ruby') {
      hasRuby = true;
    }

    for (const child of node.childNodes) {
      [offset, byteLen] = this.recurse(
        paragraphs,
        fragments,
        offset,
        byteLen,
        child,
        hasRuby,
        filter,
      );
    }

    if (display === 'block') {
      breakIfBlock();
    }

    return [offset, byteLen];
  }

  protected breakParagraph(paragraphs: Paragraph[], fragments: Fragment[]): [number, number] {
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

    return [0, 0];
  }

  protected pushText(
    fragments: Fragment[],
    offset: number,
    byteLen: number,
    text: Text | CDATASection,
    hasRuby: boolean,
  ): [number, number] {
    // Ignore empty text nodes, as well as whitespace at the beginning of the run
    if (text.data.length > 0 && !(fragments.length === 0 && text.data.trim().length === 0)) {
      fragments.push({
        start: offset,
        length: text.length,
        end: (offset += text.length),
        node: text,
        hasRuby,
      });

      byteLen += text.length * 2;
    }

    return [offset, byteLen];
  }

  protected displayCategory(node: Element | Node): DisplayCategory {
    if (node instanceof Text || node instanceof CDATASection) {
      return 'text';
    }

    if (node instanceof Element) {
      const display = getComputedStyle(node).display.split(/\s/g);
      const [first] = display;

      if (first === 'none') {
        return 'none';
      }

      if (node.tagName === 'RUBY') {
        return 'ruby';
      }

      if (node.tagName === 'RP') {
        return 'none';
      }

      if (node.tagName === 'RT') {
        return 'ruby-text';
      }

      if (node.tagName === 'RB') {
        return 'inline';
      }

      if (display.some((x) => x.startsWith('block'))) {
        return 'block';
      }

      if (display.some((x) => x.startsWith('inline'))) {
        return 'inline';
      }

      if (first === 'flex') {
        return 'block';
      }

      if (first === '-webkit-box') {
        return 'block';
      } // Old name of flex? Still used on Google Search for some reason.

      if (first === 'grid') {
        return 'block';
      }

      if (first.startsWith('table')) {
        return 'block';
      }

      if (first.startsWith('flow')) {
        return 'block';
      }

      if (first === 'ruby') {
        return 'ruby';
      }

      if (first.startsWith('ruby-text')) {
        return 'ruby-text';
      }

      if (first.startsWith('ruby-base')) {
        return 'inline';
      }

      if (first.startsWith('math')) {
        return 'inline';
      }

      if (display.includes('list-item')) {
        return 'block';
      }

      if (first === 'contents') {
        return 'inline';
      }

      if (first === 'run-in') {
        return 'block';
      }
    }

    return 'none';
  }
}
