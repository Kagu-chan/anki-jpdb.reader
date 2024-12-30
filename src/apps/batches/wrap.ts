import { insertBefore } from './insert-before';

export const wrap = (node: Node, wrapper: HTMLElement): void => {
  insertBefore(wrapper, node);

  wrapper.append(node);
};
