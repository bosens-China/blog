import { issues } from 'article';
import { Feed } from 'feed';
import dayjs from 'dayjs';
import { TITLE } from '@/constant/blog';
import { metadata } from '../layout';
import { getDescribe } from '@/components/article-card';

export async function GET() {
  const feed = new Feed({
    title: TITLE,
    description: metadata.description!,
    id: 'https://bosens-china.github.io/blog/',
    link: 'https://bosens-china.github.io/blog/page/1',
    language: 'zh-CN',
    image: 'https://bosens-china.github.io/blog/favicon.svg',
    favicon: 'https://bosens-china.github.io/blog/favicon.svg',
    copyright: '© 2019 present yliu',
    updated: dayjs(issues.at(0)?.updated_at || issues.at(0)?.created_at || undefined).toDate(),
    author: {
      name: 'yliu',
      email: 'yangboses@gmail.com',
      link: 'https://bosens-china.github.io/blog/about',
    },
  });

  issues.forEach((item) => {
    feed.addItem({
      title: item.title,
      id: item.id,
      link: `https://bosens-china.github.io/blog/details/${item.id}`,
      description: getDescribe(item.body_text),
      content: item.body_html,
      date: dayjs(item.updated_at || item.created_at).toDate(),
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
