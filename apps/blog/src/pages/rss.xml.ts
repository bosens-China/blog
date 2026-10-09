import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPostSeo, siteMeta, sortedPosts } from '@/utils/data';
import { routes } from '@/utils/routes';
import { toPlainDescription } from '@/utils/text';

export function GET(context: APIContext) {
  return rss({
    title: '小蜗的个人博客',
    description: siteMeta.site_seo?.description || '记录技术文章以及生活随笔',
    site: context.site ?? '',
    items: sortedPosts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.created_at),
      description:
        getPostSeo(post)?.description || toPlainDescription(post.body),
      link: routes.article(post.number),
    })),
    customData: `<language>zh-cn</language>`,
  });
}
