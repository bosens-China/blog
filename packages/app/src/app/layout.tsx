import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@unocss/reset/sanitize/sanitize.css";
import "@unocss/reset/sanitize/assets.css";
import "./global.scss";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={[inter.className, "bg-#F6F5FA"].join(" ")}>
        <div id="app" className="max-w-1600px m-auto">
          {children}
        </div>
      </body>
    </html>
  );
}