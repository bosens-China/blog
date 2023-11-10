import { FC } from "react";
import { PageNumber, Props as PageNumberProps } from "./pageNumber";
import data from "@blog/user-data";
import { Item, TitleJumpPath } from "./item";
import { PAGETOTAL } from "@/app/constant";

type Props = {
  page?: number;
  title?: string;
  contentData?: typeof data.issuesData;
  titleJumpPath?: TitleJumpPath;
} & PageNumberProps;

export const Content: FC<Props> = ({
  page = 1,
  pageData,
  title,
  contentData,
  titleJumpPath,
}) => {
  // 从哪里开始取数据
  const currentPageData =
    contentData ||
    data.issuesData.slice((page - 1) * PAGETOTAL, page * PAGETOTAL);

  return (
    <div id="qzhai-main" className="uk-first-column">
      <div className="qzhai-main-content uk-card uk-card-default">
        <div className="uk-card-header">
          <div className="qzhai-card-header-title">{title || "最新文章"}</div>
        </div>
        <div className="uk-card-body">
          {!currentPageData.length && <p>数据为空</p>}
          <ul className="qzhai-list-loop">
            {currentPageData.map((item) => {
              return (
                <Item
                  key={item.id}
                  {...item}
                  titleJumpPath={titleJumpPath}
                ></Item>
              );
            })}
          </ul>
        </div>
      </div>
      {pageData.length >= 2 && (
        <PageNumber pageData={pageData} page={page}></PageNumber>
      )}
    </div>
  );
};
