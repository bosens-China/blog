import React from 'react';
import { Tag } from 'antd';
import { repositories } from 'article';
import '@/app/details/[id]/style.scss';

const App: React.FC = () => {
  const data = repositories.toSorted((a, b) => b.stars - a.stars);
  return (
    <ul className="max-h-50 overflow-auto">
      {data.map((item) => (
        <li key={item.name} className="flex mt-1">
          <div className="flex-1">
            <a href={item.url} target="_blank">
              {item.name}
            </a>
          </div>
          <div className="flex-2">
            <span>star：</span>
            <Tag>{item.stars}</Tag>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default App;
