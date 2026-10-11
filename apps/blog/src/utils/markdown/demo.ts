import type MarkdownIt from 'markdown-it';
import { getDemoUrl, parseDemoInfo } from '../demos/definition';
import { renderCodePreview } from './codePreview';

export function renderDemo(
  md: MarkdownIt,
  info: string,
  source: string,
  codeHtml: string,
  codeActions: string,
): string | undefined {
  const demo = parseDemoInfo(info);
  if (!demo) return;
  const title = md.utils.escapeHtml(demo.title);
  return renderCodePreview(
    md,
    demo.title,
    `<iframe data-src="${getDemoUrl(source)}" title="${title}" sandbox="allow-scripts" height="${demo.height}" class="block w-full m-0 border-0" data-demo-frame></iframe>`,
    codeHtml,
    codeActions,
  );
}
