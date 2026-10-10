import posts from '@blog/data/data/posts.json';
import meta from '@blog/data/data/meta.json';
import aboutData from '@blog/data/data/about.json';
import { toTimestamp } from './date';

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

// 提取作者 GitHub 链接与头像
export const authorGithub = allPosts[0]?.user?.html_url || '#';
export const authorAvatar = allPosts[0]?.user?.avatar_url;

// 按照时间降序排序
export const sortedPosts = [...allPosts].sort(
  (a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at),
);

/** 每篇文章只有一个 label，即其分类 */
export function getPostCategory(post: Post): string | undefined {
  return post.labels[0]?.name;
}

export function getPostSeo(post: Post) {
  return siteMeta.posts_meta[post.id.toString()]?.seo ?? undefined;
}
