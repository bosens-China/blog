export interface AdjacentLink {
  title: string;
  href: string;
}

export interface Adjacent {
  prev?: AdjacentLink | undefined;
  next?: AdjacentLink | undefined;
}

/**
 * 在按阅读顺序（旧 → 新）排列的序列中，取当前项的上一篇与下一篇
 */
export function getAdjacent<T>(
  orderedItems: T[],
  isCurrent: (item: T) => boolean,
  toLink: (item: T) => AdjacentLink,
): Adjacent {
  const index = orderedItems.findIndex(isCurrent);
  if (index < 0) return {};
  const prev = orderedItems[index - 1];
  const next = orderedItems[index + 1];
  return {
    prev: prev ? toLink(prev) : undefined,
    next: next ? toLink(next) : undefined,
  };
}
