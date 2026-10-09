import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import { katex } from '@mdit/plugin-katex';
import { katexOptions, markdownOptions } from './options';

export interface TocItem {
  slug: string;
  title: string;
  /** 0 为顶层，1 为次级 */
  depth: 0 | 1;
  /** 顶层条目下的次级标题数量，仅在需要时填充 */
  count?: number;
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

/** 文章目录：顶层与次级两层 */
export function buildArticleToc(content: string): TocItem[] {
  const headings = extractHeadings(content);
  const top = getTopLevel(headings);
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

/** 周刊目录：只列分类（顶层），并统计每个分类下的项目数 */
export function buildWeeklyToc(content: string): TocItem[] {
  const headings = extractHeadings(content);
  const top = getTopLevel(headings);
  if (top === undefined) return [];

  const items: TocItem[] = [];
  for (const { level, slug, title } of headings) {
    if (level === top) {
      items.push({ slug, title, depth: 0, count: 0 });
    } else if (level === top + 1) {
      const current = items.at(-1);
      if (current) current.count = (current.count ?? 0) + 1;
    }
  }
  return items.length >= MIN_TOC_ITEMS ? items : [];
}
