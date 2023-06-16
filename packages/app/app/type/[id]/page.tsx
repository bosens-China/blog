import React from 'react';
import { List } from '@/components/list';
import { Metadata } from 'next';
import { labels } from '@blog/pull-data';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  return {
    title: `blog-${id === 'all' ? '全部' : labels.find((f) => `${f.id}` === id)?.name}`,
    description: '芒果不加冰的个人博客，分享技术、生活和随笔',
  };
}

export default function Type({ params }: { params: { id: string } }) {
  return <List params={params}></List>;
}
