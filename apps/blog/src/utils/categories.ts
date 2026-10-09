import { getPostCategory, sortedPosts, type Post } from './data';
import { createCategorySlug } from './slug';

export interface Category {
  name: string;
  slug: string;
  /** 按发布时间倒序 */
  posts: Post[];
}

function buildCategories(): Category[] {
  const map = new Map<string, Post[]>();
  for (const post of sortedPosts) {
    const name = getPostCategory(post);
    if (!name) continue;
    const list = map.get(name) ?? [];
    list.push(post);
    map.set(name, list);
  }

  return [...map.entries()]
    .map(([name, posts]) => ({ name, slug: createCategorySlug(name), posts }))
    .sort((a, b) => b.posts.length - a.posts.length);
}

/** 文章数从多到少 */
export const categories = buildCategories();
