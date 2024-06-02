import Image from "next/image";
import Link from "next/link";
import user from "@blog/rear-end/json/userData";
import Input from "@/components/Input";

export default function LeftSide() {
  const list = [
    {
      alt: "github",
      href: "https://z.wiki/autoupload/20240525/k6tQ/logo_github.svg",
      url: "",
    },
    {
      alt: "掘金",
      href: "https://z.wiki/autoupload/20240525/zdME/logo_juejin.svg",
      url: "",
    },
    {
      alt: "知乎",
      href: "https://z.wiki/autoupload/20240525/aRYD/logo_zhihu.svg",
      url: "",
    },
  ];

  return (
    <div className="w-220px">
      <aside className="bg-white rounded-12 p-20 flex flex-col items-center">
        <Image
          alt="个人头像"
          src={user.avatar_url}
          width={100}
          height={100}
          priority
          className="b-rounded-50%"
        ></Image>
        <hgroup>
          <h1 className="m-0 p-0 m-t-20 mb-10 text-center lh-24px text-size-22px font-500 color-#222">
            {user.name}
          </h1>
          <h2 className="m-0 p-0 whitespace-pre-wrap text-center text-size-14px lh-16px color-#666 mb-20 font-400">
            {user.bio}
          </h2>
        </hgroup>
        <nav className="w-100%">
          <ul className="list-none m-0 p-0">
            <li>
              <button className="btn btn-activate">首页</button>
            </li>
            <li>
              <button className="btn">关于我</button>
            </li>
          </ul>
        </nav>
        <ul className="flex items-center nth-2:m-20 list-none m-0 p-0">
          {list.map((item) => {
            return (
              <li key={item.href}>
                <Link className="" href={item.url} title={item.alt}>
                  <Image
                    src={item.href}
                    alt={item.alt}
                    width={24}
                    height={24}
                  ></Image>
                </Link>
              </li>
            );
          })}
        </ul>
        <Input placeholder="搜索"></Input>
      </aside>
      <footer>
        <div className="link mt-20">总访问量：0</div>
        <Link className="link " href="/about">
          页面设置
        </Link>
        <Link className="link" href={user.blog}>
          blog source code
        </Link>
      </footer>
    </div>
  );
}
