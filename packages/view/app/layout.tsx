import type { Metadata } from "next";
import data from "@blog/side-effect";
import "./styles/index.scss";
import { RightSide } from "./components/rightSide";

import StyledComponentsRegistry from "./lib/AntdRegistry";
import dynamicNext from "next/dynamic";
import Side from "./components/side";

export const dynamic = "error";

export const metadata: Metadata = {
  title: {
    template: `%s | ${data.user.name} 的个人博客`,
    default: `${data.user.name} 的个人博客`,
  },
  description: "记录生活随笔以及技术博客",
  keywords: data.label.map((f) => f.name),
  referrer: "no-referrer-when-downgrade",
};

const Statistics = dynamicNext(() => import("./statistics"), { ssr: false });
const AssetsWatch = dynamicNext(() => import("./assetsWatch"), { ssr: false });
// const Side = dynamicNext(() => import("./components/side"), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        <link
          rel="icon"
          href={`${process.env.NEXT_PUBLIC_BASE_PATH}/favicon.ico`}
          sizes="any"
        />
        <meta name="author" content={data.user.name} />
        <meta
          name="google-site-verification"
          content="4FVbyJeMZIl9kKhdo9gaJLqZviP6Z5En9GbS5VD8g6w"
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          <div id="qzhai-net" className="wp qzhai-net">
            <Side></Side>
            <div className="qzhai-net-main">{children}</div>
            <RightSide></RightSide>
          </div>
          <Statistics></Statistics>
          <AssetsWatch></AssetsWatch>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
