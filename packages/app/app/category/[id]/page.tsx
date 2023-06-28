import React, { FC } from 'react';
import { Content } from '@/layout/content';
import { Column } from '@/layout/column';

interface Props {
  params: Params;
  searchParams: SearchParams;
}

interface Params {
  id: string;
}

interface SearchParams {
  page: string;
}

// 分类页面
const Category: FC<Props> = ({ params: { id }, searchParams: { page } }) => {
  return (
    <Content>
      <Column page={page} id={id}></Column>
    </Content>
  );
};

export default Category;
