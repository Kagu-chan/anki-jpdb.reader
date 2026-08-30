import { createElement } from '@shared/dom/create-element';
import { displayToast } from '@shared/dom/display-toast';
import { findElement } from '@shared/dom/find-element';

export const showTextOverlay = (host: HTMLElement, title: string, content: string): void => {
  const backdrop = createElement('div', {
    class: 'backdrop',
    attributes: {
      role: 'dialog',
      'aria-modal': 'true',
    },
    handler: (): void => {
      hideTextOverlay(host);
    },
  });

  host.appendChild(backdrop);

  const overlay = createElement('div', {
    class: 'overlay',
    children: [
      {
        tag: 'div',
        class: 'overlay-header',
        children: [
          {
            tag: 'h3',
            innerText: title,
          },
          {
            tag: 'span',
            class: 'overlay-copy',
            innerText: '⎘',
            attributes: {
              title: 'Copy to clipboard',
            },
            handler: (ev): void => {
              ev?.stopPropagation();

              void navigator.clipboard.writeText(content).then(() => {
                displayToast('success', 'Copied to clipboard', undefined, true);
              });
            },
          },
        ],
      },
      {
        tag: 'pre',
        innerText: content,
      },
    ],
  });

  host.appendChild(overlay);
  document.body.style.overflow = 'hidden';
};

export const hideTextOverlay = (host: HTMLElement): void => {
  findElement(host, '.backdrop')?.remove();
  findElement(host, '.overlay')?.remove();
  document.body.style.overflow = '';
};
