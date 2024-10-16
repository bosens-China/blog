import { Title } from '@/components/title';
import { getLabelArticles } from '@/utils/article';
import { labels } from 'article';
import Image from 'next/image';
import ic_angle_down from '@/assets/img/ic_angle_down.svg';

export const Classify = () => {
  return (
    <section>
      <Title>分类</Title>
      <ul className="bg-#fff rounded-3">
        {labels.slice(0, 10).map((f) => (
          <li className="font-400 font-size-4 p-x-3.75 color-#222 lh-4.69" key={f.id}>
            <div className="flex justify-between p-y-3.5 _bor-1px">
              <div className="">{f.name}</div>
              <div className="color-#666">{getLabelArticles(f.id).length}</div>
            </div>
          </li>
        ))}
        {labels.length > 10 && (
          <li className="text-center">
            <button className="p-t-3 p-b-2.25 color-#0F7AE5 font-400 lh-6 text-size-3.75 inline-flex items-center">
              展开
              <Image src={ic_angle_down} width={24} height={24} alt="展开"></Image>
            </button>
          </li>
        )}
      </ul>
    </section>
  );
};
