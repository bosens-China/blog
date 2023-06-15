'use client';
import React from 'react';
import { Share } from '@/components/share';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';

export const LefttSide = () => {
  const items = [
    { label: '首页' },
    { label: '示例页面' },
    { label: '下载安装' },
    { label: '其他主题' },
    { label: '搜索' },
  ];
  return (
    <div className="layout-left">
      <p className="layout-left-information">
        <Avatar
          image="https://avatars.githubusercontent.com/u/39508895?s=400&u=62a91c3289ed4cdb0f7d7a41f520585ac5dc19af&v=4"
          size="xlarge"
          shape="circle"
        />

        <p>boses 的小窝</p>
        <p>我的小窝</p>
        <Share></Share>
        <Menu model={items} />
      </p>
      {/* <p>备案xxxx</p> */}
    </div>
  );
};
