import posts from '@blog/data/data/posts.json';
import meta from '@blog/data/data/meta.json';
import aboutData from '@blog/data/data/about.json';

export interface Post {
  id: number;
  number: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  labels: {
    id: number;
    name: string;
    color: string;
  }[];
  images: string[];
  word_count: number;
  reading_time: number;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface Column {
  id: string;
  name: string;
  description: string;
  article_ids: number[];
}

export interface AboutData {
  content: string;
  updated_at: string;
  visible: boolean;
}

export interface SiteMeta {
  site_seo?: {
    description?: string;
    keywords?: string[];
  };
  posts_meta: Record<
    string,
    {
      seo?: {
        description: string;
        keywords: string[];
      } | null;
      series?: string | null;
    }
  >;
  columns?: Column[];
  generated_at: string;
}

export const allPosts = posts as unknown as Post[];
export const siteMeta = meta as SiteMeta;
export const about = aboutData as AboutData;

// 提取作者 GitHub 链接
export const authorGithub = allPosts[0]?.user?.html_url || '#';

// 按照时间降序排序
export const sortedPosts = [...allPosts].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
);

// 获取所有分类 (Labels)
export const allLabels = Array.from(
  new Set(allPosts.flatMap((post) => post.labels.map((l) => l.name))),
).map((name) => {
  const label = allPosts.flatMap((p) => p.labels).find((l) => l.name === name);
  return {
    name,
    color: label?.color || '3b82f6',
  };
});

// 专栏名称到 ID 的映射
export const seriesMap = new Map(
  (siteMeta.columns || []).map((col) => [col.name, col.id]),
);

export function getSeriesIdByName(name: string): string | undefined {
  return seriesMap.get(name);
}
