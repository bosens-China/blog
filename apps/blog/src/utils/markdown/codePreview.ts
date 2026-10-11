import { randomUUID } from 'node:crypto';
import type MarkdownIt from 'markdown-it';
import codeIcon from '@/icons/code.svg?raw';
import playIcon from '@/icons/play.svg?raw';

export function renderCodePreview(
  md: MarkdownIt,
  title: string,
  previewHtml: string,
  codeHtml: string,
  codeActions: string,
  previewActions = '',
): string {
  const id = `preview-${randomUUID()}`;
  return `
    <section class="code-container not-prose" data-demo>
      <div class="code-header" data-pagefind-ignore>
        <span class="code-lang">${md.utils.escapeHtml(title)}</span>
        <div class="code-actions">
          <span class="grid">
            <span data-demo-code-actions class="invisible [grid-area:1/1]" inert><span class="code-actions">${codeActions}</span></span>
            <span data-demo-preview-actions class="[grid-area:1/1]"><span class="code-actions">${previewActions}</span></span>
          </span>
          <button type="button" class="code-btn" aria-label="查看代码" title="查看代码" aria-controls="${id}-preview ${id}-code" data-demo-toggle data-demo-view="preview">
            <span data-demo-icon="code" aria-hidden="true">${codeIcon}</span>
            <span data-demo-icon="preview" aria-hidden="true" hidden>${playIcon}</span>
          </button>
        </div>
      </div>
      <div role="region" id="${id}-preview" aria-label="演示" data-demo-panel="preview" data-pagefind-ignore>${previewHtml}</div>
      <div role="region" id="${id}-code" aria-label="代码" data-demo-panel="code" hidden>${codeHtml}</div>
    </section>`;
}
