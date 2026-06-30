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
