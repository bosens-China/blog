import Image from "next/image";
import data from "@blog/side-effect";
import Link from "next/link";
import github from "../../assets/img/github.svg";
import juejin from "../../assets/img/juejin.svg";
import zhihu from "../../assets/img/zhihu.png";
import { Menu } from "./menu";

export function Side() {
  const iconLists = [
    {
      icon: zhihu,
      url: "https://www.zhihu.com/people/bosensname",
      alt: "知乎个人主页",
    },
    {
      icon: juejin,
      url: "https://juejin.cn/user/835284568117806",
      alt: "掘金个人主页",
    },
    {
      icon: github,
      url: "https://github.com/bosens-China",
      alt: "GitHub 个人主页",
    },
  ];
  const { NEXT_PUBLIC_GITHUB_REPOSITORY } = process.env;

  return (
    <div className="uk-first-column">
      <div
        uk-sticky="offset: 50"
        className="uk-sticky"
        style={{ width: "180px" }}
      >
        <div className="qzhai-header uk-card uk-card-default">
          <div className="uk-card-header">
            <div className="hd uk-flex uk-flex-column uk-flex-middle uk-flex-center">
              <Link href="/" className="qzhai-logo">
                <Image
                  alt="user"
                  width={100}
                  height={100}
                  className="uk-border-circle"
                  src={data.user.avatar_url}
                />
              </Link>
              <div className="uk-width-expand uk-text-center">
                <h1>
                  <Link href="/"> {data.user.name} </Link>
                </h1>
                <p className="uk-text-meta uk-margin-remove">{data.user.bio}</p>
              </div>
            </div>
            <div className="icons uk-flex uk-flex-center">
              <ul className="uk-flex uk-flex-center uk-flex-wrap">
                {iconLists.map((item) => {
                  return (
                    <li key={item.url}>
                      <a href={item.url} target="_blank" title={item.alt}>
                        <Image
                          alt=""
                          src={item.icon}
                          width={20}
                          height={20}
                        ></Image>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="qzhai-nav uk-visible@s">
            <div className="menu-%e4%b8%bb%e8%8f%9c%e5%8d%95-container">
              <Menu></Menu>
            </div>
          </div>
          <form
            id="search-form"
            method="get"
            action={`${process.env.NEXT_PUBLIC_BASE_PATH}/page/1`}
            className="uk-search uk-search-navbar uk-width-1-1 qzhai_so uk-visible@s"
          >
            <input
              className="uk-search-input"
              type="search"
              name="s"
              id="s"
              placeholder="搜索"
              defaultValue=""
            />
          </form>
          <div className="qzhai-menu-icon uk-flex uk-flex-center uk-hidden@s">
            <a
              uk-navbar-toggle-icon=""
              href="#qzhai-main-menu-mobile"
              uk-toggle=""
              className="uk-icon uk-navbar-toggle-icon"
              aria-expanded="false"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect y={9} width={20} height={2} />
                <rect y={3} width={20} height={2} />
                <rect y={15} width={20} height={2} />
              </svg>
            </a>
          </div>
        </div>
        <div className="qzhai-footer-info uk-flex uk-flex-center">
          <a
            href={`https://github.com/${NEXT_PUBLIC_GITHUB_REPOSITORY}`}
            target="_blank"
            className="Record"
          >
            {NEXT_PUBLIC_GITHUB_REPOSITORY}
          </a>
        </div>
      </div>
      <div
        className="uk-sticky-placeholder"
        style={{ height: 505, margin: 0 }}
      />
    </div>
  );
}
