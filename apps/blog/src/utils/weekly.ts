import weeklyData from '@blog/data/data/weekly.json';

export interface WeeklyIssue {
  id: string;
  slug: string;
  title: string;
  source_title: string;
  description: string;
  pub_date: string | null;
  source_url: string;
  raw_url: string;
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
