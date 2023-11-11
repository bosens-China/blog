import Link from "next/link";
import { MenuCopy } from "./menuCopy";
import { Suspense } from "react";

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

export const Menu = () => {
  return (
    <Suspense
      fallback={
        <ul
          id="nav-top"
          className="qzhai-menu-universal uk-nav uk-nav-default uk-nav-center"
        >
          {menu.map((item) => {
            return (
              <li key={item.title}>
                <Link href={item.url}>{item.title}</Link>
              </li>
            );
          })}
        </ul>
      }
    >
      <MenuCopy></MenuCopy>
    </Suspense>
  );
};
