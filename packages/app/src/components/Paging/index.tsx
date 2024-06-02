import Link from "next/link";
import classnames from "classnames";

export interface PagingList {
  url: string;
  label: string;
}

interface Props {
  list: Array<PagingList>;
}

export default function Paging(props: Props) {
  const { list } = props;
  return (
    <nav className="flex items-center justify-between m-y-20">
      <button className="navigation-button navigation-button-disable">
        上一页
      </button>
      <ul className="flex-1 m-0 p-0 flex items-center justify-center list-none">
        {list.map((item, index) => {
          return (
            <li
              key={item.url}
              className={classnames({
                "mr-5": index !== list.length - 1,
              })}
            >
              <Link
                className={classnames([
                  `rounded-8 font-500 color-#222 lh-24px text-size-15 p-x-16 p-y-8 bg-white decoration-none`,
                  {
                    "bg-#0F7AE5!": !index,
                    "color-white": !index,
                  },
                ])}
                href={item.url}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <button className="navigation-button">下一页</button>
    </nav>
  );
}
