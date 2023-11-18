import Image from "next/image";
import data from "@blog/side-effect";
import Link from "next/link";
import { Menu } from "./menu";
import "./styles.scss";
import { iconLists } from "./constant";
import { Unfold } from "./unfold";
// import { useState } from "react";

export default function Side() {
  const { NEXT_PUBLIC_GITHUB_REPOSITORY } = process.env;

  const content = (
    <div className="uk-first-column" id="side">
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
    </div>
  );

  return (
    <>
      <Unfold content={content}></Unfold>

      {content}
    </>
  );
}
