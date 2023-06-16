import { Metadata } from 'next';
import { labels, problem } from '@blog/pull-data';
import Achieve, { Props as AchieveProps } from './achieve';
import React, { FC } from 'react';

type Props = {
  params: { id: string; type: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, type } = params;

  return {
    title: [
      'blog',
      id === 'all' ? '' : labels.find((f) => `${f.id}` === type)?.name,
      problem.find((f) => `${f.id}` === id)?.title,
    ].join('-'),
    description: '芒果不加冰的个人博客，分享技术、生活和随笔',
  };
}

const Details: FC<AchieveProps> = function Details(props) {
  return <Achieve params={props.params}>{props.children}</Achieve>;
};

export default Details;
