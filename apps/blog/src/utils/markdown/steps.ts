import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import { generateResponsiveImageAttrs } from '../image';

export function stepsPlugin(md: MarkdownIt): void {
  md.block.ruler.before(
    'fence',
    'image_steps',
    (state, startLine, endLine, silent) => {
      if (state.sCount[startLine]! - state.blkIndent >= 4) return false;
      const lineAt = (line: number) =>
        state.src.slice(
          state.bMarks[line]! + state.tShift[line]!,
          state.eMarks[line],
        );
      const opening = /^:::[ \t]*steps(?:[ \t]+(.*))?$/.exec(lineAt(startLine));
      if (!opening) return false;

      const images: Token[] = [];
      let nextLine = startLine + 1;
      for (; nextLine < endLine; nextLine++) {
        const line = lineAt(nextLine);
        if (!line.trim()) continue;
        if (
          state.sCount[nextLine]! < state.blkIndent ||
          state.sCount[nextLine]! - state.blkIndent >= 4
        )
          return false;
        if (/^:::[ \t]*$/.test(line)) break;

        const children =
          md.parseInline(line.trim(), state.env)[0]?.children ?? [];
        if (children.length !== 1 || children[0]?.type !== 'image')
          return false;
        images.push(children[0]);
      }
      if (nextLine === endLine || images.length === 0) return false;
      if (silent) return true;

      const token = state.push('image_steps', 'section', 0);
      token.content = opening[1]?.trim() ?? '';
      token.children = images;
      token.map = [startLine, nextLine + 1];
      state.line = nextLine + 1;
      return true;
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
  );

  md.renderer.rules.image_steps = (tokens, index, _options, env) => {
    const token = tokens[index]!;
    const images = token.children ?? [];
    const escape = md.utils.escapeHtml;
    const title = escape(token.content);
    env.hasSteps = true;

    const frames = images
      .map((image, stepIndex) => {
        const original = image.attrGet('src') ?? '';
        const { src, srcset, webpSrcset, sizes } =
          generateResponsiveImageAttrs(original);
        const caption = md.renderer.renderInlineAsText(
          image.children ?? [],
          md.options,
          env,
        );
        const alt = escape(caption);
        const sources = srcset
          ? `<source srcset="${escape(webpSrcset ?? '')}" sizes="${escape(sizes ?? '')}" type="image/webp"><source srcset="${escape(srcset)}" sizes="${escape(sizes ?? '')}" type="image/jpeg">`
          : '';
        return `<figure data-steps-frame class="m-0 min-w-0 col-start-1 row-start-1">
        <figcaption class="flex items-center justify-between gap-3 min-h-6 px-4 sm:px-4.5 leading-6">
          <span class="min-w-0 text-base sm:text-lg font-semibold text-base-text break-words" data-steps-caption>${alt}</span>
          <span data-steps-position aria-hidden="true" class="shrink-0 text-xs font-normal text-base-text-light tabular-nums">${stepIndex + 1} / ${images.length}</span>
        </figcaption>
        <button type="button" data-steps-next disabled aria-label="图解图片" class="block w-full aspect-video p-0 border-0 bg-transparent cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]">
          <picture class="block w-full h-full">${sources}<img src="${escape(src)}" data-gallery-src="${escape(original)}" alt="${alt}" title="${escape(image.attrGet('title') ?? '')}" loading="lazy" decoding="async" draggable="false" class="block w-full h-full m-0 object-contain rounded-none"></picture>
        </button>
      </figure>`;
      })
      .join('\n');

    const buttonClass =
      'inline-flex items-center gap-1.5 min-h-11 px-3 rounded-md border-0 bg-transparent text-sm text-base-text-light cursor-pointer hover:bg-base-hover hover:text-base-text disabled:opacity-35 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-base-text-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';
    return `<section data-image-steps role="region" aria-label="${title || '分步图解'}" class="not-prose my-7 pt-4 overflow-hidden rounded-lg border border-base-border bg-base-bg text-base-text">
      ${title ? `<div class="px-4 sm:px-4.5 pb-2 text-xs sm:text-[0.8125rem] leading-5 text-base-text-light break-words">${title}</div>` : ''}
      <div data-steps-stage>${frames}</div>
      <span data-steps-progress role="status" aria-live="polite" aria-atomic="true" class="sr-only"></span>
      <div data-steps-controls hidden class="items-center justify-between gap-2 px-2 sm:px-2.5 pb-2" data-pagefind-ignore>
        <button type="button" data-steps-prev class="${buttonClass}" disabled><span class="i-carbon-chevron-left w-4 h-4" aria-hidden="true"></span>上一步</button>
        <button type="button" data-steps-next class="${buttonClass}">下一步<span class="i-carbon-chevron-right w-4 h-4" aria-hidden="true"></span></button>
      </div>
    </section>`;
  };
}
