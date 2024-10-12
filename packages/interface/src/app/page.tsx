import { Paging } from '@/components/paging';
import { Title } from '@/components/title';
import { PAGE_SIZE } from '@/config';
import { issues } from 'article';

export default function Home() {
  const list = issues.slice(0, PAGE_SIZE);

  return (
    <>
      <Title>最新文章</Title>
      <div className="bg-#fff b-rounded-3">
        <ul>
          {list.map((item) => {
            return (
              <li key={item.id}>
                <div>{item.title}</div>
                <div>{item.body?.slice(0, 100)}</div>
                <div className="flex"></div>
              </li>
            );
          })}
        </ul>
      </div>
      <Paging></Paging>
    </>
  );
}
