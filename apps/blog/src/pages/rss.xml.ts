import rss from '@astrojs/rss';
import { sortedPosts, siteMeta } from '@/utils/data';
import { weeklyIssues } from '@/utils/weekly';

function toPlainDescription(content: string) {
  const plain = content
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#*`~_>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${Array.from(plain).slice(0, 200).join('')}...`;
}

export async function GET(context: any) {
  const postItems = sortedPosts.map((post) => {
    const seoDesc = siteMeta.posts_meta[post.id.toString()]?.seo?.description;
    return {
      title: post.title,
      pubDate: new Date(post.created_at),
      description: seoDesc || toPlainDescription(post.body),
      link: `/posts/${post.id}/`,
    };
  });

  const weeklyItems = weeklyIssues.map((issue) => ({
    title: `GitHub 周刊 · ${issue.title}`,
    pubDate: new Date(issue.pub_date || 0),
    description: issue.description || toPlainDescription(issue.body),
    link: `/weekly/${issue.slug}/`,
  }));

  return rss({
    title: '小蜗的个人博客',
    description: siteMeta.site_seo?.description || '记录技术文章以及生活随笔',
    site: context.site,
    items: [...postItems, ...weeklyItems].sort(
      (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
    ),
    customData: `<language>zh-cn</language>`,
  });
}
