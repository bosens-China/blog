"use client";
import { FC, useMemo } from "react";
import data from "@blog/user-data";
import showdown from "showdown";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import "./styles.scss";

type Props = (typeof data.issuesData)[number];

export const Item: FC<Props> = (props) => {
  const converter = new showdown.Converter();
  const html = converter.makeHtml(props.body || "");

  const dom = document.createElement("div");
  dom.innerHTML = html;

  const type = props.labels;

  const imgs = Array.from(dom.querySelectorAll("img"));

  const time = dayjs(props.updated_at).format("YYYY-MM-DD");

  const content = useMemo(() => {
    const total = imgs.length <= 1 ? 100 : 70;
    const text = dom.textContent || "";
    return text.length >= total ? text.slice(0, total) + "......" : text;
  }, [dom.textContent, imgs.length]);

  if (!imgs.length) {
    return (
      <li
        className="item uk-grid-medium uk-grid-match uk-grid uk-grid-stack"
        uk-grid=""
      >
        <div className="uk-width-1-1 uk-first-column">
          <div className="uk-flex uk-flex-column uk-flex-between">
            <div>
              <h2>
                <Link href={`/details/${props.id}`}>{props.title}</Link>
              </h2>
              <p>{content}</p>
            </div>
            <div className="other">
              {type.map((item) => {
                return (
                  <Link
                    href={`type/${item.id}`}
                    key={item.id}
                    className="label"
                  >
                    {item.name}
                  </Link>
                );
              })}

              <time>{time}</time>
            </div>
          </div>
        </div>
      </li>
    );
  }
  if (imgs.length === 1) {
    return (
      <li className="item uk-grid-medium uk-grid-match uk-grid" uk-grid="">
        <div className="uk-width-2-3 uk-first-column">
          <div className="uk-flex uk-flex-column uk-flex-between">
            <div>
              <h2>
                <Link href={`/details/${props.id}`}>{props.title}</Link>
              </h2>
              <p>{content}</p>
            </div>
            <div className="other">
              {type.map((item) => {
                return (
                  <Link
                    href={`type/${item.id}`}
                    key={item.id}
                    className="label"
                  >
                    {item.name}
                  </Link>
                );
              })}

              <time>{time}</time>
            </div>
          </div>
        </div>
        <div className="uk-width-1-3">
          <Link
            href={`/details/${props.id}`}
            className="uk-flex uk-flex-column uk-flex-right"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
            uk-img=""
          >
            <Image
              width={200}
              height={100}
              style={{
                width: "100%",
                height: "auto",
              }}
              src={imgs[0].src}
              alt={imgs[0].src}
              className="img "
            ></Image>
          </Link>
        </div>
      </li>
    );
  }

  return (
    <li
      className="item multi-map uk-grid-medium uk-grid-match uk-grid uk-grid-stack"
      uk-grid=""
    >
      <div className="uk-width-1-1 uk-first-column">
        <div className="uk-flex uk-flex-column uk-flex-between">
          <div>
            <h2>
              <Link href={`/details/${props.id}`}>{props.title}</Link>
            </h2>
            <p>{content}</p>
          </div>
        </div>
      </div>
      <div className="uk-width-1-1 multi-img-grid uk-grid-margin uk-first-column">
        <div className="uk-child-width-1-3 uk-grid-medium uk-grid" uk-grid="">
          {imgs.slice(0, 3).map((item, index) => {
            return (
              <div
                className={!index ? "uk-first-column" : ""}
                key={item.src + index}
              >
                <Link
                  href={`/details/${props.id}`}
                  className="uk-background-cover"
                  uk-img=""
                >
                  <Image
                    width={200}
                    data-img={item.src}
                    height={130}
                    style={{
                      width: "100%",
                      height: "auto",
                    }}
                    src={item.src}
                    alt={item.src}
                    className="img"
                  ></Image>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <div className="uk-width-1-1 other uk-margin-small-top uk-grid-margin uk-first-column">
        <div>
          {type.map((item) => {
            return (
              <Link href={`type/${item.id}`} key={item.id} className="label">
                {item.name}
              </Link>
            );
          })}

          <time>{time}</time>
        </div>
      </div>
    </li>
  );
};
