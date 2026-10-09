import weeklyData from '@blog/data/data/weekly.json';

export interface WeeklyRepoItem {
  repo: string;
  url: string;
  description: string;
  language: string;
  total_stars: string;
  period_stars: string;
  homepage: string;
  topics: string[];
  image: string;
  source_image?: string;
  summary: string;
  tags: string[];
}

export interface WeeklyCategory {
  name: string;
  items: WeeklyRepoItem[];
}

export interface WeeklyIssue {
  id: string;
  slug: string;
  title: string;
  source_title: string;
  description: string;
  pub_date: string | null;
  rss_pub_date?: string | null;
  source_url: string;
  raw_url: string;
  report_url?: string;
  source?: string;
  issue?: number | null;
  date?: string;
  report_generated_at?: string | null;
  project_count?: number;
  category_count?: number;
  categories?: WeeklyCategory[];
  body: string;
  images: string[];
  word_count: number;
  reading_time: number;
}

export interface WeeklyData {
  generated_at: string | null;
  feed_url: string;
  last_build_date: string | null;
  items: WeeklyIssue[];
}

export const weekly = weeklyData as WeeklyData;

export const weeklyIssues = [...weekly.items].sort(
  (a, b) =>
    new Date(b.pub_date || 0).getTime() - new Date(a.pub_date || 0).getTime(),
);

export function getWeeklyIssue(slug: string): WeeklyIssue | undefined {
  return weeklyIssues.find((issue) => issue.slug === slug);
}

export function getWeeklyProjectCount(issue: WeeklyIssue): number {
  if (typeof issue.project_count === 'number') return issue.project_count;
  if (issue.categories?.length) {
    return issue.categories.reduce(
      (total, category) => total + category.items.length,
      0,
    );
  }
  return 0;
}

export function getWeeklyCategoryCount(issue: WeeklyIssue): number {
  if (typeof issue.category_count === 'number') return issue.category_count;
  return issue.categories?.length ?? 0;
}

/** 期数；早期数据缺少 issue 字段时从标题「第 N 期」中解析 */
export function getWeeklyIssueNumber(issue: WeeklyIssue): number | undefined {
  if (typeof issue.issue === 'number') return issue.issue;
  const match = /第\s*(\d+)\s*期/.exec(issue.title || issue.source_title);
  return match ? Number(match[1]) : undefined;
}

/** 列表摘要：前 3 个项目名 + 项目总数与方向数，结构化数据缺失时退回原始描述 */
export function getWeeklySummary(issue: WeeklyIssue): string {
  const highlights = getWeeklyHighlights(issue);
  if (highlights.length === 0) return issue.description;

  const projectCount = getWeeklyProjectCount(issue);
  const categoryCount = getWeeklyCategoryCount(issue);
  const names = highlights.join(' · ');
  const total =
    projectCount > highlights.length ? ` 等 ${projectCount} 个项目` : '';
  const scope = categoryCount > 1 ? `，涵盖 ${categoryCount} 个方向` : '';
  return `${names}${total}${scope}`;
}

/** 当期前 N 个项目的仓库名（去掉 owner），用于列表摘要 */
export function getWeeklyHighlights(issue: WeeklyIssue, limit = 3): string[] {
  return (issue.categories ?? [])
    .flatMap((category) => category.items)
    .slice(0, limit)
    .map((item) => item.repo.split('/').at(-1) ?? item.repo);
}

/** 周刊正文自带一级标题，详情页已单独渲染标题，这里去掉避免重复 */
export function getWeeklyBody(issue: WeeklyIssue): string {
  return issue.body.replace(/^\s*#\s+[^\n]*\n+/, '');
}
