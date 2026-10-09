import { getYear } from './date';

export interface YearGroup<T> {
  year: string;
  items: T[];
}

/** 按年份分组，保持输入顺序（调用方负责先排序） */
export function groupByYear<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
): YearGroup<T>[] {
  const groups: YearGroup<T>[] = [];
  for (const item of items) {
    const year = getYear(getDate(item));
    const last = groups.at(-1);
    if (last?.year === year) last.items.push(item);
    else groups.push({ year, items: [item] });
  }
  return groups;
}
