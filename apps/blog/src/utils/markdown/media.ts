import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';

export type MediaKind = 'video' | 'audio';

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;
const AUDIO_EXT = /\.(mp3|m4a|aac|wav|flac|ogg|oga|opus)(\?.*)?$/i;
// GitHub Issue 编辑器上传视频后插入的是单独一行的附件链接，不带扩展名
const GITHUB_ASSET =
  /^https:\/\/github\.com\/user-attachments\/assets\/[\w-]+$/;

export function getMediaKind(url: string): MediaKind | undefined {
  if (VIDEO_EXT.test(url) || GITHUB_ASSET.test(url)) return 'video';
  if (AUDIO_EXT.test(url)) return 'audio';
  return undefined;
}

/** 从 URL 中提取文件名作为音频的兜底标题 */
function fileNameOf(url: string): string {
  try {
    const name = new URL(url, 'https://placeholder.local').pathname
      .split('/')
      .at(-1);
    return name ? decodeURIComponent(name).replace(/\.[^.]+$/, '') : '';
  } catch {
    return '';
  }
}

function renderVideo(src: string, caption: string): string {
  return `<figure class="not-prose my-8">
  <video controls preload="metadata" playsinline src="${src}" class="block w-full aspect-video rounded-lg border border-base-border bg-black object-contain"></video>
  ${caption ? `<figcaption class="mt-2 text-center text-sm text-base-text-light">${caption}</figcaption>` : ''}
</figure>`;
}

function renderAudio(src: string, title: string): string {
  return `<figure class="not-prose my-8 flex items-center gap-3 sm:gap-4 rounded-lg border border-base-border px-3 sm:px-4 py-3" data-audio-player>
  <audio preload="metadata" src="${src}"></audio>
  <button type="button" data-audio-toggle aria-label="播放" class="shrink-0 w-9 h-9 rounded-full border border-base-border flex-center text-base-text hover:bg-base-hover transition-colors cursor-pointer">
    <span data-audio-icon class="i-carbon-play-filled-alt w-4 h-4"></span>
  </button>
  <div class="flex-1 min-w-0">
    <p class="truncate text-sm text-base-text">${title}</p>
    <div data-audio-progress role="slider" tabindex="0" aria-label="播放进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" class="mt-1 py-1.5 cursor-pointer">
      <div class="relative h-1 rounded-full bg-base-border overflow-hidden">
        <div data-audio-fill class="absolute inset-y-0 left-0 w-0 bg-base-text-light"></div>
      </div>
    </div>
  </div>
  <span data-audio-time class="shrink-0 text-xs text-base-text-light tabular-nums">0:00</span>
</figure>`;
}

function renderMedia(
  md: MarkdownIt,
  kind: MediaKind,
  src: string,
  label: string,
): string {
  const safeSrc = md.utils.escapeHtml(src);
  if (kind === 'video') return renderVideo(safeSrc, md.utils.escapeHtml(label));
  const title = label || fileNameOf(src) || '音频';
  return renderAudio(safeSrc, md.utils.escapeHtml(title));
}

/** 段落中只有一个媒体链接或媒体图片时，返回其地址与文字 */
function matchStandaloneMedia(
  inline: Token,
): { kind: MediaKind; src: string; label: string } | undefined {
  const children = (inline.children ?? []).filter(
    (child) => !(child.type === 'text' && !child.content.trim()),
  );

  const [first, second, third] = children;
  if (children.length === 1 && first?.type === 'image') {
    const src = first.attrGet('src') ?? '';
    const kind = getMediaKind(src);
    return kind ? { kind, src, label: first.content } : undefined;
  }

  if (
    children.length === 3 &&
    first?.type === 'link_open' &&
    second?.type === 'text' &&
    third?.type === 'link_close'
  ) {
    const src = first.attrGet('href') ?? '';
    const kind = getMediaKind(src);
    // 裸链接的文字就是地址本身，此时不作为标题
    const isBareUrl =
      first.markup === 'linkify' ||
      first.markup === 'autolink' ||
      second.content === src;
    const label = isBareUrl ? '' : second.content;
    return kind ? { kind, src, label } : undefined;
  }
  return undefined;
}

/** 原始 HTML 中的 <audio>，提取地址与 title，替换为统一的播放器 */
function matchAudioHtml(
  html: string,
): { src: string; label: string } | undefined {
  if (!/^\s*<audio\b/i.test(html)) return undefined;
  const src =
    /<audio\b[^>]*\bsrc=["']([^"']+)["']/i.exec(html)?.[1] ??
    /<source\b[^>]*\bsrc=["']([^"']+)["']/i.exec(html)?.[1];
  if (!src) return undefined;
  const label = /<audio\b[^>]*\btitle=["']([^"']+)["']/i.exec(html)?.[1] ?? '';
  return { src, label };
}

/**
 * markdown-it 插件：将独占一段的视频 / 音频链接、媒体图片语法、原始 <audio> 渲染为统一的媒体块
 * 原始 <video> 与 iframe 嵌入保持原样，由正文样式统一外观
 */
export function mediaPlugin(md: MarkdownIt): void {
  md.core.ruler.push('standalone_media', (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!token) continue;

      if (token.type === 'html_block') {
        const audio = matchAudioHtml(token.content);
        if (audio)
          token.content = renderMedia(md, 'audio', audio.src, audio.label);
        continue;
      }

      const inline = tokens[i + 1];
      if (
        token.type !== 'paragraph_open' ||
        inline?.type !== 'inline' ||
        tokens[i + 2]?.type !== 'paragraph_close'
      ) {
        continue;
      }

      // 单行书写的 <audio>…</audio> 不属于 HTML 块，会被解析成段落
      const inlineAudio = /^<audio\b[\s\S]*(<\/audio>|\/>)$/i.test(
        inline.content.trim(),
      )
        ? matchAudioHtml(inline.content)
        : undefined;
      const media = inlineAudio
        ? { kind: 'audio' as const, ...inlineAudio }
        : matchStandaloneMedia(inline);
      if (!media) continue;

      const block = new state.Token('html_block', '', 0);
      block.content = renderMedia(md, media.kind, media.src, media.label);
      tokens.splice(i, 3, block);
    }
  });
}
