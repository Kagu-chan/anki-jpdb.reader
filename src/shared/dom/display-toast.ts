import { getStyleUrl } from '../extension/get-style-url';
import { createElement } from './create-element';
import { findElement } from './find-element';

const toasts: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>();

function startMessageTimeout(message: string): void {
  const timeout = setTimeout(() => {
    toasts.delete(message);
  }, 5000);

  toasts.set(message, timeout);
}

function restartMessageTimeout(message: string): void {
  const timeout = toasts.get(message);

  if (timeout) {
    clearTimeout(timeout);
    startMessageTimeout(message);
  }
}

function getOrCreateToastContainer(): HTMLDivElement {
  let shadowRoot: ShadowRoot | null = findElement<'div'>('#ajb-toast-container')?.shadowRoot;

  if (!shadowRoot) {
    const toastContainer = createElement('div', {
      id: 'ajb-toast-container',
    });

    shadowRoot = toastContainer.attachShadow({ mode: 'open' });

    shadowRoot.append(
      createElement('link', {
        attributes: { rel: 'stylesheet', href: getStyleUrl('toast') },
      }),
      createElement('ul', { id: 'ajb-toast-item-container', class: 'notifications' }),
    );

    document.body.appendChild(toastContainer);
  }

  return shadowRoot.getElementById('ajb-toast-item-container') as HTMLDivElement;
}

export function displayToast(type: 'error' | 'success', message: string, error?: string): void {
  const timeoutDuration = 500;

  if (toasts.has(message)) {
    restartMessageTimeout(message);

    return;
  }

  startMessageTimeout(message);

  const container = getOrCreateToastContainer();
  const toast: HTMLLIElement = createElement('li', {
    class: ['toast', 'outline', type],
    handler: () => toast.classList.add('hide'),
    children: [
      {
        tag: 'div',
        class: ['column'],
        children: [
          {
            tag: 'span',
            innerHTML: message,
          },
          type === 'error'
            ? {
                tag: 'span',
                innerText: '⎘',
                handler(ev?: MouseEvent): void {
                  ev?.stopPropagation();

                  void navigator.clipboard.writeText(error ?? message);
                },
              }
            : false,
        ],
      },
    ],
  });

  container.appendChild(toast);

  let timeout: NodeJS.Timeout | undefined;
  const startTimeout = (t: number = timeoutDuration): void => {
    if (timeout) {
      return;
    }

    timeout = setTimeout(() => {
      toast.classList.add('hide');

      stopTimeout();
      setTimeout(() => toast.remove(), 500);
    }, t);
  };
  const stopTimeout = (): void => {
    if (timeout) {
      clearTimeout(timeout);

      timeout = undefined;
    }
  };

  startTimeout();

  toast.addEventListener('mouseover', () => stopTimeout());
  toast.addEventListener('mouseout', () => startTimeout(500));
}
