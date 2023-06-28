import { Content } from '@/layout/content';
import { Column } from '@/layout/column';
import { FC } from 'react';

export interface RootSearchParams {
  page?: string;
  search?: string;
}

interface Props {
  params: void;
  searchParams: RootSearchParams;
}

const Home: FC<Props> = ({ searchParams }) => {
  return (
    <Content>
      <Column {...searchParams}></Column>
    </Content>
  );
};

export default Home;
