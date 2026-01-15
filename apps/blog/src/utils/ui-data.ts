import { allLabels, allPosts, siteMeta, type Post } from './data';

// 图标映射表
const CATEGORY_ICONS: Record<string, string> = {
  Frontend: 'i-carbon-code',
  Backend: 'i-carbon-data-base',
  Python: 'i-carbon-logo-python',
  JavaScript: 'i-carbon-logo-javascript',
  TypeScript: 'i-carbon-logo-typescript',
  React: 'i-carbon-logo-react',
  Vue: 'i-carbon-logo-vue',
  Life: 'i-carbon-cafe',
  Thinking: 'i-carbon-idea',
  Design: 'i-carbon-paint-brush',
  DevOps: 'i-carbon-cloud-services',
  Tools: 'i-carbon-tool-box',
};

// 专栏渐变色
const GRADIENTS = [
  'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 text-blue-600 dark:text-blue-400',
  'from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 text-purple-600 dark:text-purple-400',
  'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-600 dark:text-emerald-400',
  'from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 text-orange-600 dark:text-orange-400',
];

export interface CategoryData {
  name: string;
  slug: string;
  color: string;
  posts: Post[];
  total: number;
  icon: string;
}

export function getCategories(): CategoryData[] {
  return allLabels
    .map((label) => {
      const posts = allPosts
        .filter((post) => post.labels.some((l) => l.name === label.name))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 3);

      const total = allPosts.filter((post) =>
        post.labels.some((l) => l.name === label.name),
      ).length;

      return {
        name: label.name,
        slug: label.name, // Use name as slug since data.ts doesn't provide slug
        color: label.color,
        posts,
        total,
        icon: CATEGORY_ICONS[label.name] || 'i-carbon-tag',
      };
    })
    .sort((a, b) => b.total - a.total);
}

export interface ColumnData {
  id: string;
  name: string;
  description: string;
  article_ids: number[];
  posts: Post[];
  lastUpdated: string;
  gradient: string;
}

export function getColumns(): ColumnData[] {
  return (siteMeta.columns || []).map((column, index) => {
    const posts = column.article_ids
      .map((id) => allPosts.find((p) => p.id === id))
      .filter((p): p is Post => !!p)
      .slice(0, 3);

    let lastUpdated = 'N/A';
    if (posts.length > 0 && posts[0]) {
      lastUpdated = new Date(posts[0].created_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    }

    return {
      id: column.id,
      name: column.name,
      description: column.description,
      article_ids: column.article_ids,
      posts,
      lastUpdated,
      gradient: GRADIENTS[index % GRADIENTS.length] || '',
    };
  });
}
