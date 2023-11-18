"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
const menu = [
  {
    url: "/",
    pharma: /page\/\d+/,
    title: "首页",
  },
  {
    url: "/about",
    title: "关于我",
  },
];

export function Menu() {
  const pathname = usePathname();
  return (
    <ul
      id="nav-top"
      className="qzhai-menu-universal uk-nav uk-nav-default uk-nav-center"
    >
      {menu.map((item) => {
        return (
          <li
            key={item.title}
            className={
              [item.url, item.pharma].find((f) => {
                if (f instanceof RegExp) {
                  return f.test(pathname);
                }
                return f === pathname;
              })
                ? "uk-active"
                : ""
            }
          >
            <Link href={item.url}>{item.title}</Link>
          </li>
        );
      })}
    </ul>
  );
}
