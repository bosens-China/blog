import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { routes } from '@/utils/routes';
import { toPlainDescription } from '@/utils/text';
import { getWeeklyProjectCount, weeklyIssues } from '@/utils/weekly';

export function GET(context: APIContext) {
  return rss({
    title: '小蜗的周刊',
    description: '每周一更新，收录本周值得关注的 GitHub 开源项目。',
    site: context.site ?? '',
    items: weeklyIssues.map((issue) => {
      const projectCount = getWeeklyProjectCount(issue);
      return {
        title: issue.title,
        pubDate: new Date(issue.pub_date || 0),
        description:
          issue.description ||
          (projectCount > 0
            ? `本期收录 ${projectCount} 个项目`
            : toPlainDescription(issue.body)),
        link: routes.weekly(issue.slug),
      };
    }),
    customData: `<language>zh-cn</language>`,
  });
}
