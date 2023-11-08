import { FC } from "react";
import { PageNumber } from "./pageNumber";
import data from "@blog/user-data";
import { Item } from "./item";

interface Props {
  page?: number;
}

const PAGETOTAL = 10;

export const Content: FC<Props> = ({ page = 1 }) => {
  // 从哪里开始取数据
  const currentPageData = data.issuesData.slice(
    (page - 1) * PAGETOTAL,
    page * PAGETOTAL
  );

  return (
    <div id="qzhai-main" className="uk-width-3-4@s uk-first-column">
      <div className="qzhai-main-content uk-card uk-card-default">
        <div className="uk-card-header">
          <div className="qzhai-card-header-title">最新文章</div>
        </div>
        <div className="uk-card-body">
          <ul className="qzhai-list-loop">
            {currentPageData.map((item) => {
              return <Item key={item.id} {...item}></Item>;
            })}
          </ul>
        </div>
      </div>
      <PageNumber></PageNumber>
    </div>
  );
};
