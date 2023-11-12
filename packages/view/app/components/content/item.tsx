import { FC, useMemo } from "react";
import { default as UserData } from "@blog/side-effect";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import "./styles.scss";
import { extractImgTags, mdToText, textToAbstract } from "@/app/utils/text";

export type TitleJumpPath = string;

type Props = (typeof UserData.issuesData)[number] & {
  jumpPath?: TitleJumpPath;
  // 搜索参数
  s?: string;
};

export const Item: FC<Props> = ({
  body,
  s,
  labels: type,
  updated_at,
  id,
  jumpPath,
  title,
}) => {
  const text = mdToText(body || "");
  const imgAll = extractImgTags(body || "");

  const time = dayjs(updated_at).format("YYYY-MM-DD");

  const content = useMemo(() => {
    const total = imgAll.length <= 1 ? 100 : 70;
    const t = textToAbstract(text, total);
    return t !== text ? t + "......" : t;
  }, [imgAll.length, text]);

  const path = useMemo(() => {
    if (!jumpPath) {
      return `/details/${id}`;
    }
    return jumpPath.replace(/<ARTICLE_ID>/g, `${id}`);
  }, [id, jumpPath]);

  const ItemTitle = (
    <h2>
      <Link
        href={path}
        dangerouslySetInnerHTML={{
          __html: s
            ? title.replace(new RegExp(s, "ig"), (value: string) => {
                return `<span style="color: red">${value}</span>`;
              })
            : title,
        }}
      ></Link>
    </h2>
  );

  if (!imgAll.length) {
    return (
      <li
        className="item uk-grid-medium uk-grid-match uk-grid uk-grid-stack"
        uk-grid=""
      >
        <div className="uk-width-1-1 uk-first-column">
          <div className="uk-flex uk-flex-column uk-flex-between">
            <div>
              {ItemTitle}
              <p>{content}</p>
            </div>
            <div className="other">
              {type.map((item) => {
                return (
                  <Link
                    href={`/types/${item.id}`}
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
  if (imgAll.length === 1) {
    return (
      <li className="item uk-grid-medium uk-grid-match uk-grid" uk-grid="">
        <div className="uk-width-2-3 uk-first-column">
          <div className="uk-flex uk-flex-column uk-flex-between">
            <div>
              {ItemTitle}
              <p>{content}</p>
            </div>
            <div className="other">
              {type.map((item) => {
                return (
                  <Link
                    href={`/types/${item.id}`}
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
            href={`/details/${id}`}
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
              src={imgAll[0]}
              alt={imgAll[0]}
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
            {ItemTitle}
            <p>{content}</p>
          </div>
        </div>
      </div>
      <div className="uk-width-1-1 multi-img-grid uk-grid-margin uk-first-column">
        <div className="uk-child-width-1-3 uk-grid-medium uk-grid" uk-grid="">
          {imgAll.slice(0, 3).map((item, index) => {
            return (
              <div
                className={!index ? "uk-first-column" : ""}
                key={item + index}
              >
                <Link
                  href={`/details/${id}`}
                  className="uk-background-cover"
                  uk-img=""
                >
                  <Image
                    width={200}
                    data-img={item}
                    height={130}
                    style={{
                      width: "100%",
                      height: "auto",
                    }}
                    src={item}
                    alt={item}
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
              <Link href={`/types/${item.id}`} key={item.id} className="label">
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
