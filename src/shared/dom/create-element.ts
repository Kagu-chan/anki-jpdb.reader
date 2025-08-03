import { appendElement } from './append-element';
import { DOMElementOptions, DOMElementTagOptions } from './types';

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: DOMElementOptions,
): HTMLElementTagNameMap[K];
export function createElement<K extends keyof HTMLElementTagNameMap>(
  options: DOMElementTagOptions<K>,
): HTMLElementTagNameMap[K];

export function createElement(
  p0: string | DOMElementTagOptions,
  p1?: DOMElementOptions,
): HTMLElement {
  const tag = typeof p0 === 'string' ? p0 : p0.tag;
  const options = (p1 ?? p0 ?? {}) as DOMElementOptions;

  const e = document.createElement(tag);
  const id = options.id;

  if (options.id) {
    e.setAttribute('id', id as string);
  }

  if (options.innerText !== undefined) {
    e.innerText = String(options.innerText);
  }

  if (options.handler) {
    e.onclick = options.handler;
    e.ontouchstart = (e): void => options.handler!(e);
  }

  if (options.events) {
    for (const key of Object.keys(options.events)) {
      (e as unknown as Record<string, (ev: Event) => void>)[key] = options.events[key];
    }
  }

  if (options.attributes) {
    for (const key of Object.keys(options.attributes)) {
      const value = options.attributes[key];

      if (value !== false) {
        e.setAttribute(key, value as string);
      }
    }
  }

  if (options.style) {
    for (const key of Object.keys(options.style)) {
      const style = options.style[key as keyof CSSStyleDeclaration];

      (e.style as unknown as Record<string, typeof style>)[key] = style;
    }
  }

  if (options.class) {
    options.class = Array.isArray(options.class) ? options.class : [options.class];
    e.classList.add(...options.class.filter(Boolean));
  }

  (options.children ?? [])
    .filter((ch) => ch)
    .forEach((ch: HTMLElement | DOMElementTagOptions<keyof HTMLElementTagNameMap>) =>
      appendElement(e, ch instanceof HTMLElement ? ch : createElement(ch)),
    );

  return e;
}
