import type { Metadata } from "next";
import data from "@blog/user-data";
import "./styles/global.css";
import { Statistics } from "./statistics";
import { Side } from "./components/side";
import { RightSide } from "./components/rightSide";

export const metadata: Metadata = {
  title: `${data.user.name} 的个人博客`,
  description: "记录生活随笔，以及技术博客",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body>
        <>
          <Statistics></Statistics>
          <div id="qzhai-net" className="wp qzhai-net">
            <Side></Side>
            <div className="qzhai-net-main">{children}</div>

            <RightSide></RightSide>
          </div>
        </>
      </body>
    </html>
  );
}
