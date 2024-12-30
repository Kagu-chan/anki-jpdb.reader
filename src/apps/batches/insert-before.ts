export const insertBefore = (newNode: HTMLElement, referenceNode: Node): void => {
  referenceNode.parentElement!.insertBefore(newNode, referenceNode);
};
