import type { Metadata } from "next";
import data from "@blog/user-data";
import "./styles/global.css";
import { Statistics } from "./statistics";
import { Side } from "./components/side";
import { RightSide } from "./components/rightSide";
import { AssetsWatch } from "./assetsWatch";

export const dynamic = "error";

export const metadata: Metadata = {
  title: {
    template: `%s | ${data.user.name} 的个人博客`,
    default: `${data.user.name} 的个人博客`,
  },
  description: "记录生活随笔以及技术博客",
};

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
      </head>
      <body>
        <div id="qzhai-net" className="wp qzhai-net">
          <Side></Side>
          <div className="qzhai-net-main">{children}</div>
          <RightSide></RightSide>
        </div>
        <Statistics></Statistics>
        <AssetsWatch></AssetsWatch>
      </body>
    </html>
  );
}
