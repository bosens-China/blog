import { bundledLanguagesInfo } from 'shiki';

const PLAIN_TEXT_LANGS = new Set(['', 'text', 'txt', 'plain', 'plaintext']);

/** 语言 id 与别名 → 正式名称，如 ts → TypeScript */
const languageNames = new Map<string, string>(
  bundledLanguagesInfo.flatMap((info) =>
    [info.id, ...(info.aliases ?? [])].map(
      (key) => [key.toLowerCase(), info.name] as const,
    ),
  ),
);

/** 纯文本块默认自动换行，代码块默认保留横向滚动以维持缩进结构 */
export function isPlainTextLang(lang: string): boolean {
  return PLAIN_TEXT_LANGS.has(lang.toLowerCase());
}

/** 代码块标题栏展示的语言名称 */
export function getLanguageLabel(lang: string): string {
  if (isPlainTextLang(lang)) return '纯文本';
  return languageNames.get(lang.toLowerCase()) ?? lang;
}
