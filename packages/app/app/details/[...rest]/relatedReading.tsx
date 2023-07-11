import React, { FC } from 'react';
import { getImgArr, obtainClassification } from '@/utils';
import clsx from 'clsx';
import { EmptyState } from '@/components/emptyState';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Link from 'next/link';

interface Props {
  id: string;
  type?: string;
}

const Blank = () => {
  return <></>;
};

export const RelatedReading: FC<Props> = ({ id, type }) => {
  const data = obtainClassification(type).filter((f) => f.id !== +id);

  if (!data.length) {
    return null;
  }

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
      slidesToSlide: 4, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  return (
    <div className="qzhai-related-articles uk-card uk-card-default uk-margin">
      <div className="uk-card-header">
        <div className="qzhai-card-header-title">相关阅读</div>
      </div>
      <div className="uk-card-body">
        <Carousel
          customDot={<Blank></Blank>}
          responsive={responsive}
          ssr
          showDots
          infinite
          containerClass="container-with-dots"
          itemClass="image-item"
          autoPlay={true}
          arrows={false}
          renderArrowsWhenDisabled={true}
        >
          {data.map((item) => {
            const initialImage = getImgArr(item?.html || '').at(0);

            return (
              <div tabIndex={-1} className="uk-active" style={{ order: 1 }} key={item?.id}>
                <div className="uk-card uk-position-relative">
                  {initialImage ? (
                    <div
                      className={clsx('img', 'uk-background-cover')}
                      uk-img=""
                      style={{
                        backgroundImage: `url("${initialImage}")`,
                      }}
                    />
                  ) : (
                    <EmptyState style={{ opacity: 0 }}></EmptyState>
                  )}

                  <h3
                    className="uk-card-title uk-margin-small-top uk-margin-remove-bottom"
                    style={{ textAlign: 'center' }}
                  >
                    {item?.title}
                  </h3>
                  <Link href={[`/details/${item?.id}`, type ? `/${type}` : ''].join('')} />
                </div>
              </div>
            );
          })}
        </Carousel>
      </div>
    </div>
  );
};
