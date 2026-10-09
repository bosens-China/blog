import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import { katex } from '@mdit/plugin-katex';
import { katexOptions, markdownOptions } from './options';

export interface TocItem {
  slug: string;
  title: string;
  /** 0 为顶层，1 为次级 */
  depth: 0 | 1;
}

interface TocOptions {
  /**
   * 固定顶层标题级别；不传时按正文自动推断
   * 结构由程序生成的内容（如周刊固定为 H2 分类 + H3 项目）应显式指定，避免推断偏差
   */
  topLevel?: number;
}

interface Heading {
  level: number;
  slug: string;
  title: string;
}

/** 少于该数量的条目时不显示目录 */
const MIN_TOC_ITEMS = 3;

/** 使用与正文渲染相同的 anchor 插件解析标题，保证 slug 与页面中的 id 一致 */
function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const md = MarkdownIt(markdownOptions)
    .use(katex, katexOptions)
    .use(anchor, {
      callback: (token, { slug, title }) => {
        headings.push({ level: Number(token.tag.slice(1)), slug, title });
      },
    });
  md.parse(content, {});
  return headings;
}

/** 取出现至少两次的最高层级作为顶层，避免单个 H1 标题把整篇正文都挂在一个条目下 */
function getTopLevel(headings: Heading[]): number | undefined {
  const counts = new Map<number, number>();
  headings.forEach(({ level }) =>
    counts.set(level, (counts.get(level) ?? 0) + 1),
  );
  return [...counts.keys()]
    .sort((a, b) => a - b)
    .find((level) => (counts.get(level) ?? 0) >= 2);
}

/** 正文目录：顶层与次级两层，文章与周刊共用 */
export function buildToc(content: string, options: TocOptions = {}): TocItem[] {
  const headings = extractHeadings(content);
  const top = options.topLevel ?? getTopLevel(headings);
  if (top === undefined) return [];

  const items = headings
    .filter(({ level }) => level === top || level === top + 1)
    .map<TocItem>(({ slug, title, level }) => ({
      slug,
      title,
      depth: level === top ? 0 : 1,
    }));
  return items.length >= MIN_TOC_ITEMS ? items : [];
}
