import type { Metadata } from "next";
import data from "@blog/side-effect";
import "./styles/index.scss";
import { Statistics } from "./statistics";
import { Side } from "./components/side";
import { RightSide } from "./components/rightSide";
import { AssetsWatch } from "./assetsWatch";
import StyledComponentsRegistry from "./lib/AntdRegistry";

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
