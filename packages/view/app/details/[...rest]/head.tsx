import dayjs from "dayjs";
import Link from "next/link";

import data from "@blog/user-data";
import { FC, Suspense } from "react";
import { CopyIcon } from "./client";

interface Props {
  current: (typeof data.issuesData)[number];
}

export const Head: FC<Props> = ({ current }) => {
  return (
    <>
      <h1 className="uk-article-title">{current.title}</h1>
      <ul
        className="qzhai-article-subnav uk-subnav uk-subnav-divider"
        uk-margin=""
      >
        <li>
          <Suspense
            fallback={
              <a>
                <i className="qzf qzf-layers" />
              </a>
            }
          >
            <CopyIcon></CopyIcon>
          </Suspense>

          {current.labels.map((f) => {
            return (
              <Link key={f.id} href={`/types/${f.id}`}>
                {f.name}
              </Link>
            );
          })}
        </li>
        <li>
          <span>
            <i className="qzf qzf-calender" />{" "}
            {dayjs(current.updated_at).format(`YYYY-MM-DD`)}
          </span>
        </li>
        <li>
          <span>
            <i className="qzf qzf-eye" />
            <span id="busuanzi_value_page_pv">0</span>人
          </span>
        </li>
      </ul>
    </>
  );
};
