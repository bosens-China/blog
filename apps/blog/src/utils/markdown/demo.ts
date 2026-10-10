import { randomUUID } from 'node:crypto';
import type MarkdownIt from 'markdown-it';
import { getDemoUrl, parseDemoInfo } from '../demos/definition';
import codeIcon from '@/icons/code.svg?raw';
import playIcon from '@/icons/play.svg?raw';

export function renderDemo(
  md: MarkdownIt,
  info: string,
  source: string,
  codeHtml: string,
  codeActions: string,
): string | undefined {
  const demo = parseDemoInfo(info);
  if (!demo) return;
  const id = `demo-${randomUUID()}`;
  const title = md.utils.escapeHtml(demo.title);
  return `
    <section class="code-container not-prose" data-demo>
      <div class="code-header" data-pagefind-ignore>
        <span class="code-lang">${title}</span>
        <div class="code-actions">
          <span data-demo-code-actions class="invisible" inert><span class="code-actions">${codeActions}</span></span>
          <button type="button" class="code-btn" aria-label="查看代码" title="查看代码" aria-controls="${id}-preview ${id}-code" data-demo-toggle data-demo-view="preview">
            <span data-demo-icon="code" aria-hidden="true">${codeIcon}</span>
            <span data-demo-icon="preview" aria-hidden="true" hidden>${playIcon}</span>
          </button>
        </div>
      </div>
      <div role="region" id="${id}-preview" aria-label="演示" data-demo-panel="preview" data-pagefind-ignore>
        <iframe data-src="${getDemoUrl(source)}" title="${title}" sandbox="allow-scripts" height="${demo.height}" class="block w-full m-0 border-0" data-demo-frame></iframe>
      </div>
      <div role="region" id="${id}-code" aria-label="代码" data-demo-panel="code" hidden>${codeHtml}</div>
    </section>`;
}
