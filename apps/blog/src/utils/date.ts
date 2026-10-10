const SHANGHAI_TIME_ZONE = 'Asia/Shanghai';

type DateInput = string | Date | null | undefined;

function toValidDate(date: DateInput): Date | null {
  if (!date) return null;
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: SHANGHAI_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 按上海时区拆出年月日，保证构建机时区不影响展示 */
function getDateParts(date: DateInput) {
  const parsedDate = toValidDate(date);
  if (!parsedDate) return null;
  const parts = dateFormatter.formatToParts(parsedDate);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return { year: get('year'), month: get('month'), day: get('day') };
}

/** 2026-10-08 */
export function formatDate(date: DateInput): string {
  const parts = getDateParts(date);
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : '';
}

/** 10-08，用于同一年份分组内 */
export function formatMonthDay(date: DateInput): string {
  const parts = getDateParts(date);
  return parts ? `${parts.month}-${parts.day}` : '';
}

export function getYear(date: DateInput): string {
  return getDateParts(date)?.year ?? '';
}

/** 2026-10，用于按月份分组的唯一 key */
export function getYearMonthKey(date: DateInput): string {
  const parts = getDateParts(date);
  return parts ? `${parts.year}-${parts.month}` : '';
}

/** 2026 年 10 月，用于月份分组标题展示（贴合国内读者习惯） */
export function formatYearMonth(date: DateInput): string {
  const parts = getDateParts(date);
  if (!parts) return '';
  const monthNum = parseInt(parts.month, 10);
  return `${parts.year} 年 ${monthNum} 月`;
}

export function toTimestamp(date: DateInput): number {
  return toValidDate(date)?.getTime() ?? 0;
}
