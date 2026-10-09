import { createCategorySlug } from './slug';

/** 全站路由的唯一出处，页面与组件统一从这里取链接 */
export const routes = {
  home: () => '/',
  articles: () => '/articles/',
  article: (number: number) => `/articles/${number}/`,
  categories: () => '/categories/',
  category: (name: string) => `/categories/${createCategorySlug(name)}/`,
  seriesList: () => '/series/',
  series: (id: string) => `/series/${id}/`,
  weeklyList: () => '/weekly/',
  weekly: (slug: string) => `/weekly/${slug}/`,
  rss: () => '/rss.xml',
  weeklyRss: () => '/weekly/rss.xml',
  about: () => '/about/',
};
