import data from "@blog/user-data";
import Link from "next/link";

export const Recently = () => {
  const all = data.issuesData.slice(0, 5);
  return (
    <li id="qzhai_widget_posts-8" className="qzhai-widget qzhai-widget-posts">
      <div className="uk-card uk-card-default">
        <div className="uk-card-header">
          <h4>近期文章</h4>
        </div>
        <ul className="qzhai-widget-posts-box">
          {all.map((item) => {
            return (
              <li className="text" key={item.id}>
                <Link href={`/details/${item.id}`} data-can-open={1}>
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
};
