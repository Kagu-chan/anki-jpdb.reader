export const insertAfter = (newNode: HTMLElement, referenceNode: Node): void => {
  const parent = referenceNode.parentElement!;
  const sibling = referenceNode.nextSibling;

  if (sibling) {
    parent.insertBefore(newNode, sibling);

    return;
  }

  parent.appendChild(newNode);
};
