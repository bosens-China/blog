import { allPosts, siteMeta, type Post } from './data';
import { toTimestamp } from './date';

export interface Series {
  id: string;
  name: string;
  description: string;
  /** 按发布时间正序，即阅读顺序 */
  posts: Post[];
  latestDate: string;
}

const postById = new Map(allPosts.map((post) => [post.id, post]));

function buildSeries(): Series[] {
  return (siteMeta.columns ?? [])
    .map((column) => {
      const posts = column.article_ids
        .map((id) => postById.get(id))
        .filter((post): post is Post => Boolean(post))
        .sort((a, b) => toTimestamp(a.created_at) - toTimestamp(b.created_at));

      return {
        id: column.id,
        name: column.name,
        description: column.description,
        posts,
        latestDate: posts.at(-1)?.created_at ?? '',
      };
    })
    .filter((series) => series.posts.length > 0)
    .sort((a, b) => toTimestamp(b.latestDate) - toTimestamp(a.latestDate));
}

/** 最近更新的专栏在前 */
export const seriesList = buildSeries();

const seriesByPostId = new Map<number, Series>();
for (const series of seriesList) {
  for (const post of series.posts) seriesByPostId.set(post.id, series);
}

export function getSeriesOfPost(post: Post): Series | undefined {
  return seriesByPostId.get(post.id);
}
