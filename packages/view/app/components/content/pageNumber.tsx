import { FC, useMemo } from "react";
import Link from "next/link";

export interface Props {
  pagingData: Array<{
    url: string;
    page: number;
  }>;
  // 当前页数
  page: number;
}

export const PageNumber: FC<Props> = ({ pagingData, page }) => {
  const arr = useMemo(() => {
    if (pagingData.length <= 9) {
      return pagingData;
    }
    const count = pagingData.length;

    let place: Array<string | number> = [];
    switch (page) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        place = [1, 2, 3, 4, 5, 6, 7, "next", count];
        break;

      case count:
      case count - 1:
      case count - 2:
      case count - 3:
      case count - 4:
        place = [
          1,
          "pre",
          count - 6,
          count - 5,
          count - 4,
          count - 3,
          count - 2,
          count - 1,
          count,
        ];
        break;

      default:
        place = [
          1,
          "pre",
          page - 2,
          page - 1,
          page,
          page + 1,
          page + 2,
          "next",
          count,
        ];
        break;
    }
    return place.map((f) => (typeof f === "number" ? pagingData[f - 1] : null));
  }, [page, pagingData]);

  return (
    <div className="qzhai-pagination-box uk-margin-top uk-flex uk-flex-center">
      <ul className="uk-pagination qzhai-pagination uk-margin">
        {arr.map((item, index) => {
          if (!item) {
            return <li key={index}>...</li>;
          }
          return (
            <li
              className={page === item.page ? "uk-active" : ""}
              key={item.url}
            >
              <Link href={item.url}>{item.page}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
