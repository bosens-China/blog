import React from 'react';
import { List } from '@/components/list';
import { Metadata } from 'next';

export default function Home() {
  return <List></List>;
}

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const title = searchParams.search ? `blog-搜索${searchParams.search}` : 'blog';

  return {
    title,
    description: '芒果不加冰的个人博客，分享技术、生活和随笔',
  };
}
