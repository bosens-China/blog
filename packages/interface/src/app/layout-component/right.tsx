import { Title } from '@/components/title';
import { allLabels, getLabelArticles } from '@/utils/article';
import { issues } from 'article';
import dayjs from 'dayjs';

export const Right = () => {
  return (
    <div className="w-60 ml-10">
      <div>
        <Title>分类</Title>
        <ul className="bg-#fff rounded-3">
          {allLabels.map((f) => (
            <li className="p-x-3.75 p-y-3.5 flex justify-between font-400 font-size-4 color-#222 lh-4.69" key={f.id}>
              <div>{f.name}</div>
              <div className="color-#666">{getLabelArticles(f.id).length}</div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Title>近期文章</Title>
        <ul className="bg-#fff rounded-3 ">
          {issues.slice(0, 5).map((item) => {
            return (
              <li className="p-3.75 font-400 font-size-4 color-#222 lh-6 " key={item.id}>
                <div>{item.title}</div>
                <div className="color-#999 font-size-3.5 lh-5">{dayjs(item.updated_at).format('YYYY-MM-DD')}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
