import Image from "next/image";
import Link from "next/link";
import { user } from "@blog/rear-end";
import Input from "@/components/Input";

export default function LeftSide() {
  const list = [
    {
      alt: "github",
      href: "https://z.wiki/autoupload/20240525/k6tQ/logo_github.svg",
    },
    {
      alt: "掘金",
      href: "https://z.wiki/autoupload/20240525/zdME/logo_juejin.svg",
    },
    {
      alt: "知乎",
      href: "https://z.wiki/autoupload/20240525/aRYD/logo_zhihu.svg",
    },
  ];

  return (
    <header className="w-220px">
      <div className="bg-white rounded-12px p-20px flex flex-col items-center">
        <Image
          alt="个人头像"
          src={user.avatar_url}
          width={100}
          height={100}
          className="b-rounded-50%"
        ></Image>
        <div className="m-t-20px mb-10px  lh-24px text-size-22px font-500 color-#222">
          {user.name}
        </div>
        <div className="whitespace-pre-wrap text-center text-size-14px lh-16px color-#666 mb-20px">
          {user.bio}
        </div>
        <button className="btn btn-activate">首页</button>
        <button className="btn">关于我</button>
        <div className="flex items-center nth-2:m-20px">
          {list.map((item) => {
            return (
              <div key={item.href} className="">
                <Image
                  src={item.href}
                  alt={item.alt}
                  width={24}
                  height={24}
                ></Image>
              </div>
            );
          })}
        </div>
        <Input placeholder="搜索"></Input>
      </div>
      <Link className="link mt-20px" href="/about">
        页面设置
      </Link>
      <div className="link">总访问量：0</div>
      <Link className="link" href={user.blog}>
        blog source code
      </Link>
    </header>
  );
}
