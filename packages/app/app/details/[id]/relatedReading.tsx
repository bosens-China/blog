'use client';
import React, { FC, useMemo } from 'react';
import { problem } from '@blog/pull-data';
import { getImgArr } from '@/utils';
import clsx from 'clsx';
import { EmptyState } from '@/components/emptyState';
import dayjs from 'dayjs';
import seedrandom from 'seedrandom';
import Link from 'next/link';

// Math.seedrando

interface Props {
  id: string;
}

const random = (min: number, max: number, seed: number) => {
  const value = seedrandom(`${seed}`).quick();
  const randomNumber = Math.floor(value * (max - min + 1)) + min;
  return randomNumber;
};

const noRepeat = (min: number, max: number, arr: Array<string | number>) => {
  // 确保不取到当前的数
  let i = 0;
  const date = Number.parseInt(dayjs().format('YYYYMMDD'));
  let value = random(min, max, date);

  while (arr.find((f) => +f === value) !== undefined) {
    value = random(min, max, date + ++i);
  }

  return value;
};

export const RelatedReading: FC<Props> = ({ id }) => {
  const randomArray = useMemo(() => {
    // 返回最小4个，最多12个的随机数组
    if (problem.length <= 4) {
      return [];
    }
    const arr = Array.from({ length: Math.min(12, problem.length) })
      .fill(null)
      .map((_, index, array) => {
        const result = noRepeat(0, problem.length - 1, [id, ...(array.filter((f) => f !== null) as number[])]);
        array[index] = result;
        return result;
      });

    return arr.map((f) => problem[f]);
  }, [id]);

  if (!randomArray.length) {
    return null;
  }

  return (
    <div className="qzhai-related-articles uk-card uk-card-default uk-margin">
      <div className="uk-card-header">
        <div className="qzhai-card-header-title">相关阅读</div>
      </div>
      <div className="uk-card-body">
        <div uk-slider="autoplay: true; sets: true" className="uk-slider uk-slider-container">
          <div className="uk-position-relative uk-visible-toggle uk-light" tabIndex={-1}>
            <ul
              className="uk-slider-items uk-child-width-1-4@s uk-child-width-1-2 uk-grid uk-grid-small"
              style={{ transform: `translate3d(0px, 0px, 0px)` }}
            >
              {randomArray.map((item) => {
                const initialImage = getImgArr(item?.html || '').at(0);
                return (
                  <li tabIndex={-1} className="uk-active" style={{ order: 1 }} key={item?.id}>
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
                        <EmptyState></EmptyState>
                      )}

                      <h3
                        className="uk-card-title uk-margin-small-top uk-margin-remove-bottom"
                        style={{ textAlign: 'center' }}
                      >
                        {item?.title}
                      </h3>
                      <Link href={`/details/${item?.id}`} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
