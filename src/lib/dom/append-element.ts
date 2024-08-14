import { DOMElementTagOptions } from './dom.types';

export function appendElement<TChild extends HTMLElement = HTMLElement>(
  parent: string,
  element: TChild,
): TChild;
export function appendElement<
  TParent extends HTMLElement = HTMLElement,
  TChild extends HTMLElement = HTMLElement,
>(parent: TParent, element: TChild): TChild;
export function appendElement<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(
  parent: string,
  element: DOMElementTagOptions<K>,
): HTMLElementTagNameMap[K];
export function appendElement<
  TParent extends HTMLElement = HTMLElement,
  K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
>(parent: TParent, element: DOMElementTagOptions<K>): HTMLElementTagNameMap[K];

export function appendElement(
  parent: string | HTMLElement,
  child: HTMLElement | DOMElementTagOptions,
): HTMLElement {
  const e = child instanceof HTMLElement ? child : this.createElement(child);

  this.resolveElement(parent)?.append(e);

  return e;
}