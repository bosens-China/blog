'use client';

import { ArticleCard } from '@/components/article-card';
import { Title } from '@/components/title';
import Fuse from 'fuse.js';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { issues } from 'article';
import { useSystemTheme } from '@/hooks/use-system-theme';
import imgArtworkNoContentLight from '@/assets/img/img_artwork_no_content_light.svg';
import imgArtworkNoContentDark from '@/assets/img/img_artwork_no_content_dark.svg';
// import empty from '@/assets/img/empty.svg';
import Image from 'next/image';

const fuse = new Fuse(issues, {
  keys: ['title', 'body_text'],
  includeMatches: true,
});

export const Search = () => {
  const searchParams = useSearchParams();

  const theme = useSystemTheme();
  const imgArtworkNoContent = theme === 'dark' ? imgArtworkNoContentDark : imgArtworkNoContentLight;

  const title = useMemo(() => {
    return searchParams.get('q');
  }, [searchParams]);

  const list = useMemo(() => {
    if (!title) {
      return [];
    }
    return fuse.search(title);
  }, [title]);

  return (
    <>
      <div className="flex justify-between items-center">
        <Title>
          搜索结果：<span className="color-red">{title}</span>
        </Title>
        <div className="whitespace-nowrap color-#999">共{list.length}条</div>
      </div>
      <div className="bg-bg-2 b-rounded-3 mb-5">
        {list.map((li, index, arr) => {
          const item = li.item;
          return (
            <ArticleCard key={item.id} search={title || ''} {...item} border={index + 1 !== arr.length}></ArticleCard>
          );
        })}
        {!list.length && (
          <div className="flex justify-center items-center flex-col p-12">
            <Image src={imgArtworkNoContent} alt="空" width={180} height={180}></Image>
            <p className="lh-5.27 text-4.5 font-400 color-#999">暂无搜索结果</p>
          </div>
        )}
      </div>

      {/* <Paging current={+page} hrefTemplate={`/page/$PLACEHOLDER`}></Paging> */}
    </>
  );
};
