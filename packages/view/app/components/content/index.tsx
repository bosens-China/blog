import { FC } from "react";
import { PageNumber, Props as PageNumberProps } from "./pageNumber";
import { default as UserData } from "@blog/user-data";
import { Item, TitleJumpPath } from "./item";

type Props = {
  // 当前页数
  page: number;
  // 标题
  title: string;
  // 页面当前展示数据
  currentData: typeof UserData.issuesData;
  data: typeof UserData;
  // 跳转链接路由格式
  jumpPath?: TitleJumpPath;
  // 搜索参数
  s?: string;
} & PageNumberProps;

export const Content: FC<Props> = ({
  page = 1,
  title,
  currentData,
  jumpPath,
  pagingData,
  s,
}) => {
  return (
    <div id="qzhai-main" className="uk-first-column">
      <div className="qzhai-main-content uk-card uk-card-default">
        <div className="uk-card-header">
          <div className="qzhai-card-header-title">{title || "最新文章"}</div>
        </div>
        <div className="uk-card-body">
          {!currentData.length && <p>数据为空</p>}
          <ul className="qzhai-list-loop">
            {currentData.map((item) => {
              return (
                <Item s={s} key={item.id} {...item} jumpPath={jumpPath}></Item>
              );
            })}
          </ul>
        </div>
      </div>
      {pagingData.length >= 2 && (
        <PageNumber pagingData={pagingData} page={page}></PageNumber>
      )}
    </div>
  );
};
