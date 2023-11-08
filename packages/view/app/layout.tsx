import type { Metadata } from "next";
import data from "@blog/user-data";
import "./styles/global.css";

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
      <body>{children}</body>
    </html>
  );
}
