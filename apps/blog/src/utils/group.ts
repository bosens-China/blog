import { formatYearMonth, getYear, getYearMonthKey } from './date';

export interface YearGroup<T> {
  year: string;
  items: T[];
}

export interface MonthGroup<T> {
  /** 格式化后的月份展示标题，例如 '2026 年 9 月' */
  title: string;
  /** 年月键，例如 '2026-09' */
  key: string;
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

/** 按月份分组，保持输入顺序（调用方负责先排序） */
export function groupByMonth<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
): MonthGroup<T>[] {
  const groups: MonthGroup<T>[] = [];
  for (const item of items) {
    const key = getYearMonthKey(getDate(item));
    const title = formatYearMonth(getDate(item));
    const last = groups.at(-1);
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, title, items: [item] });
  }
  return groups;
}
