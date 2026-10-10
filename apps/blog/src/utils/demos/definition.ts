import { createHash } from 'node:crypto';

export function parseDemoInfo(info: string) {
  if (!/^tsx\s+demo(?:\s|$)/i.test(info.trim())) return;

  let rest = info.trim().replace(/^tsx\s+demo\s*/i, '');
  let title = '交互演示';
  let height = 420;
  const seen = new Set<string>();
  while (rest) {
    const match = /^(?:title="([^"\r\n]*)"|height=(\d+))(?:\s+|$)/.exec(rest);
    if (!match) throw new Error(`演示参数无效：${rest}`);
    const key = match[1] === undefined ? 'height' : 'title';
    if (seen.has(key)) throw new Error(`演示参数重复：${key}`);
    seen.add(key);
    if (key === 'title') title = match[1] || '交互演示';
    else height = Number(match[2]);
    rest = rest.slice(match[0].length);
  }
  if (height < 160 || height > 1200) {
    throw new Error('演示高度须为 160–1200 像素');
  }
  return { title, height };
}

export function getDemoId(source: string): string {
  return createHash('sha256').update(source).digest('hex').slice(0, 32);
}

export function getDemoUrl(source: string): string {
  return `/demos/${getDemoId(source)}.html`;
}
