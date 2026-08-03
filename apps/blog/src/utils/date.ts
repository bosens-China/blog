const SHANGHAI_TIME_ZONE = 'Asia/Shanghai';

function toValidDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatDate(date: string | Date | null | undefined): string {
  const parsedDate = toValidDate(date);
  if (!parsedDate) return '';
  return parsedDate.toLocaleDateString('zh-CN', {
    timeZone: SHANGHAI_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  const parsedDate = toValidDate(date);
  if (!parsedDate) return '';

  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: SHANGHAI_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(parsedDate);
  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hours = getPart('hour');
  const minutes = getPart('minute');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}
