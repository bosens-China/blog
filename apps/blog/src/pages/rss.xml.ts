import rss from '@astrojs/rss';
import { sortedPosts, siteMeta } from '@/utils/data';

export async function GET(context: any) {
  return rss({
    title: '小蜗的个人博客',
    description: siteMeta.site_seo?.description || '记录技术文章以及生活随笔',
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.created_at),
      description: post.body.slice(0, 200).replace(/[#*`~_>]/g, '') + '...',
      link: `/posts/${post.id}`,
    })),
    customData: `<language>zh-cn</language>`,
  });
}
