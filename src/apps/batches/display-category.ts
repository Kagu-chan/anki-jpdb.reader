import { DisplayCategory } from './types';

export const displayCategory = (node: Element | Node): DisplayCategory => {
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
};
