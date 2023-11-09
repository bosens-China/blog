import { FC } from "react";
import Link from "next/link";

export interface Props {
  pageData: Array<{
    url: string;
    label: string;
    page: number;
  }>;
  page: number;
  // setPage: Dispatch<SetStateAction<number>>;
}

export const PageNumber: FC<Props> = ({ pageData, page }) => {
  return (
    <div className="qzhai-pagination-box uk-margin-top uk-flex uk-flex-center">
      <ul className="uk-pagination qzhai-pagination uk-margin">
        {pageData.map((item) => {
          return (
            <li
              className={page === item.page ? "uk-active" : ""}
              key={item.url}
            >
              <Link href={item.url}>{item.label}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
