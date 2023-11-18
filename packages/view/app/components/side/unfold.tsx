"use client";

import { DrawerClassNames } from "antd/es/drawer/DrawerPanel";
import { Drawer } from "antd";
import { useState } from "react";

interface Props {
  content: React.ReactNode;
}

export function Unfold({ content }: Props) {
  const [unfold, setUnfold] = useState(false);
  const classNames: DrawerClassNames = {
    content: "sider-drawer",
  };
  return (
    <>
      <div className="qzhai-menu-icon uk-flex uk-flex-center">
        <a
          uk-navbar-toggle-icon=""
          title="展开菜单"
          className="uk-icon uk-navbar-toggle-icon"
          aria-haspopup="true"
          href="#展开菜单"
          onClick={(e) => {
            e.preventDefault();
            setUnfold(true);
          }}
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect y={9} width={20} height={2} />
            <rect y={3} width={20} height={2} />
            <rect y={15} width={20} height={2} />
          </svg>
        </a>
      </div>
      <Drawer
        classNames={classNames}
        closeIcon={false}
        placement="left"
        width={"auto"}
        onClose={() => setUnfold(false)}
        open={unfold}
        footer={null}
        title={null}
        styles={{
          body: {
            padding: "12px",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
