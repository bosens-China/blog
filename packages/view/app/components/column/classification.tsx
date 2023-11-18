import data from "@blog/side-effect";
import Link from "next/link";
import { classification } from "@blog/side-effect";

export const Classification = () => {
  return (
    <li id="nav_menu-10" className="qzhai-widget widget_nav_menu">
      <div className="uk-card uk-card-default">
        <div className="uk-card-header">
          <h4>分类查看</h4>
        </div>
        <div className="menu-container">
          <ul id="menu" className="menu">
            {data.label.map((item) => {
              const length = classification.get(`${item.id}`)?.length || 0;
              return (
                <li
                  key={item.id}
                  id="menu-item-546"
                  className="menu-item menu-item-type-taxonomy menu-item-object-category menu-item-546"
                >
                  <Link href={`/types/${item.id}`} title={item.description}>
                    {item.name}
                    <span className="types-notes">[{length}]</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </li>
  );
};
