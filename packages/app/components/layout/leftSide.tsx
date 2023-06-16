'use client';
import React, { useState } from 'react';
import { Share } from '@/components/share';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';
import Link from 'next/link';
import { MenuItem } from 'primereact/menuitem';
import { Typography } from 'antd';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useRouter, usePathname } from 'next/navigation';

declare module 'primereact/menuitem' {
  interface MenuItem {
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }
}

const { Text } = Typography;

export const LefttSide = () => {
  const template = (item: MenuItem) => {
    return (
      <Link className="p-menuitem-link" href={item.url || '#'} onClick={item.onClick}>
        {item.icon && <span className={`p-menuitem-icon ${item.icon}`}></span>}

        <span className="p-menuitem-text">{item.label}</span>
      </Link>
    );
  };
  const items: Array<MenuItem> = [
    {
      label: '首页',
      url: '/',
      template,
    },
    {
      label: '搜索',
      onClick(e) {
        e.preventDefault();
        setVisible(true);
      },
      template,
    },
    { separator: true },
    {
      label: '个人简历',
      url: '/biographicalNotes',
      template,
    },
  ];

  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState('');
  const router = useRouter();
  const path = usePathname();

  const onKeyUp: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      setVisible(false);
      router.push(`${path}?search=${value}`);
    }
  };

  return (
    <>
      <div className="layout-left">
        <div className="layout-left-information">
          <Avatar
            image="https://avatars.githubusercontent.com/u/39508895?s=400&u=62a91c3289ed4cdb0f7d7a41f520585ac5dc19af&v=4"
            size="xlarge"
            shape="circle"
          />

          <p>芒果不加冰</p>
          <p>
            <Text type="secondary">芒果不加冰的个人博客</Text>
          </p>

          <Share></Share>

          <Menu model={items} />
        </div>
      </div>
      <Dialog
        className="layout-search"
        header={false}
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
        position="top"
      >
        <InputText onKeyUp={onKeyUp} value={value} onChange={(e) => setValue(e.target.value)} />
      </Dialog>
    </>
  );
};
