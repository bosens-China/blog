import { about } from './data';
import { routes } from './routes';

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
    matches: ['/articles', '/categories'],
  },
  { label: '专栏', href: routes.seriesList(), matches: ['/series'] },
  { label: '周刊', href: routes.weeklyList(), matches: ['/weekly'] },
  ...(about.visible
    ? [{ label: '关于', href: routes.about(), matches: ['/about'] }]
    : []),
];

export function isNavActive(item: NavItem, pathname: string): boolean {
  return item.matches.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
