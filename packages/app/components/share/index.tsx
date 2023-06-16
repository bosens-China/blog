'use client';
import zhihu from './apple-touch-icon-120.d5793cac.png';
import juejin from './apple-touch-icon.png';
import github from './fluidicon.png';
import React from 'react';
import Image from 'next/image';
import './share.scss';

export const Share = () => {
  return (
    <ul className="share">
      <li>
        <a href="https://www.zhihu.com/people/bosensname">{<Image alt="zhihu" src={zhihu} />}</a>
      </li>
      <li>
        <a href="https://juejin.cn/user/835284568117806">{<Image alt="juejin" src={juejin} />}</a>
      </li>
      <li>
        <a href="https://github.com/bosens-China">{<Image alt="github" src={github} />}</a>
      </li>
    </ul>
  );
};
