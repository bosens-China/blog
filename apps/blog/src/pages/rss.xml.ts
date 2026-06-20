import rss from '@astrojs/rss';
import { sortedPosts, siteMeta } from '@/utils/data';

export async function GET(context: any) {
  return rss({
    title: '小蜗的个人博客',
    description: siteMeta.site_seo?.description || '记录技术文章以及生活随笔',
    site: context.site,
    items: sortedPosts.map((post) => {
      // 优先复用已生成的 SEO 摘要；缺失时回退到正文，去除 Markdown 噪音
      const seoDesc = siteMeta.posts_meta[post.id.toString()]?.seo?.description;
      const plain = post.body
        .replace(/!?\[[^\]]*\]\([^)]*\)/g, '') // 图片/链接
        .replace(/[#*`~_>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      // 按 Unicode 码点截断，避免切断 emoji 等代理对
      const fallback = Array.from(plain).slice(0, 200).join('');
      return {
        title: post.title,
        pubDate: new Date(post.created_at),
        description: seoDesc || `${fallback}...`,
        link: `/posts/${post.id}/`,
      };
    }),
    customData: `<language>zh-cn</language>`,
  });
}
