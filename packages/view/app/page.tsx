import Link from "next/link";
import { Classification } from "./components/column/classification";
import { Recently } from "./components/column/recently";
import { Content } from "./components/content";
import data from "@blog/user-data";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div id="qzhai-curtain" style={{ display: "none" }} />
      <div id="qzhai-net" className="wp qzhai-net">
        <div className="uk-grid-small uk-grid" uk-grid="">
          <div className="uk-width-1-6@s uk-first-column">
            <div
              uk-sticky="offset: 50"
              className="uk-sticky uk-sticky-fixed"
              style={{ width: "190px" }}
            >
              <div className="qzhai-header uk-card uk-card-default">
                <div className="uk-card-header">
                  <div className="hd uk-flex uk-flex-column uk-flex-middle uk-flex-center">
                    <a href="https://zbl.cc/" className="qzhai-logo">
                      <Image
                        alt="user"
                        width={100}
                        height={100}
                        className="uk-border-circle"
                        src={data.user.avatar_url}
                      />
                    </a>
                    <div className="uk-width-expand uk-text-center">
                      <h1>
                        <Link href="/"> {data.user.name} </Link>
                      </h1>
                      <p className="uk-text-meta uk-margin-remove">
                        {data.user.bio}
                      </p>
                    </div>
                  </div>
                  <div className="icons uk-flex uk-flex-center">
                    <ul className="uk-flex uk-flex-center uk-flex-wrap">
                      <li>
                        <a
                          href="https://zbl.cc/weibo"
                          className="qzhai-logos qzhai-logos-weibo"
                          target="_blank"
                          uk-tooltip="title: 微博; pos: bottom"
                          title=""
                          aria-expanded="false"
                        />
                      </li>
                      <li>
                        <a
                          href="https://www.zhihu.com/people/zhangbingliang"
                          className="qzhai-logos qzhai-logos-zhihu"
                          target="_blank"
                          uk-tooltip="title: 知乎; pos: bottom"
                          title=""
                          aria-expanded="false"
                        />
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="qzhai-nav uk-visible@s">
                  <div className="menu-%e4%b8%bb%e8%8f%9c%e5%8d%95-container">
                    <ul
                      id="nav-top"
                      className="qzhai-menu-universal uk-nav uk-nav-default uk-nav-center"
                    >
                      <li id="menu-item-193" className="uk-active">
                        <a href="/">首页</a>
                      </li>
                      <li id="menu-item-1896">
                        <a href="https://zbl.cc/blog">博客</a>
                      </li>
                      <li id="menu-item-138">
                        <a href="https://zbl.cc/about">关于我</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <form
                  id="search-form"
                  method="get"
                  actions="https://zbl.cc"
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
                  href="https://github.com/bosens-China/blog"
                  target="_blank"
                  className="Record"
                >
                  bosens-China/blog
                </a>
              </div>
            </div>
            <div
              className="uk-sticky-placeholder"
              style={{ height: 505, margin: 0 }}
            />
          </div>
          <div className="uk-width-5-6@s">
            <div
              id="qzhai_content"
              className="uk-grid-small uk-grid"
              uk-grid=""
            >
              <Content></Content>
              <div id="qzhai-sidebar" className="uk-width-1-4@s">
                <div className="qzhai-sidebar-box">
                  <div uk-sticky="bottom: #qzhai-sidebar" className="uk-sticky">
                    <ul className="qzhai-sidebar">
                      <Classification></Classification>
                      <Recently></Recently>
                    </ul>
                  </div>
                  <div
                    className="uk-sticky-placeholder"
                    hidden
                    style={{ height: 563, margin: 0 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
