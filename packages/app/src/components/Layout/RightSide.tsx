/* eslint-disable @typescript-eslint/no-explicit-any */
import Column from "@/components/Column";
import { latestTime } from "@/utils/time";
import { issuesData, labelsData } from "@/data";

const recentArticles = issuesData.slice(0, 5);

export default function RightSide() {
  return (
    <aside>
      <Column.Group title="分类">
        {labelsData.data.map((item, index) => {
          const [key, value] = item;
          const name = key === "unknown" ? "未分类" : key.name;
          return (
            <Column
              border={index !== labelsData.data.length - 1}
              key={name}
              title={name}
              right={value.length}
            ></Column>
          );
        })}
      </Column.Group>

      <Column.Group title="近期文章" className="mt-40">
        {recentArticles.map((item, index) => {
          const [time] = latestTime(item.created_at, item.updated_at);

          return (
            <Column
              title={item.title}
              value={time.format("YYYY-MM-DD")}
              key={item.id}
              border={index !== recentArticles.length - 1}
            ></Column>
          );
        })}
      </Column.Group>
    </aside>
  );
}
