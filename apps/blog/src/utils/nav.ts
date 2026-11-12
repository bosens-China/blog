import { routes } from './routes';
import { seriesList } from './series';

export interface NavItem {
  label: string;
  href: string;
  /** 属于该入口的路由前缀，用于判断当前页高亮 */
  matches: string[];
}

export const navItems: NavItem[] = [
  {
    label: '文章',
    href: routes.articles(),
    matches: ['/articles'],
  },
  { label: '分类', href: routes.categories(), matches: ['/categories'] },
  ...(seriesList.length
    ? [{ label: '专栏', href: routes.seriesList(), matches: ['/series'] }]
    : []),
  { label: '周刊', href: routes.weeklyList(), matches: ['/weekly'] },
];

export function isNavActive(item: NavItem, pathname: string): boolean {
  return item.matches.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
