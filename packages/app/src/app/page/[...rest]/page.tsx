import Title from "@/components/Title";
import { client } from "@blog/rear-end/request";
import { ResultArticle } from "@blog/rear-end/routes/convert.js";
import Image from "next/image";
import dayjs from "dayjs";
import classnames from "classnames";
import React from "react";
import Paging, { PagingList } from "@/components/Paging";
// import { readData } from "@blog/rear-end/routes/issues.js";
// import { redirect } from "next/navigation";

interface Props {
  params: { rest: [string] | [string, string] };
  searchParams: Record<string, string>;
}

// 把所有结果都返回出来即可
export async function generateStaticParams() {
  const result: Props["params"][] = [];
  const res = await client.api.issues.filtration[":type"].$get({
    param: { type: "" },
    query: {},
  });
  if (!res.ok) {
    return result;
  }
  const data = await res.json();
  for (const [key, iterator] of Object.entries(data)) {
    iterator.forEach((item) => {
      const [page] = item;
      if (key === "all") {
        result.push({ rest: [`${page}`] });
        return;
      }
      result.push({
        rest: [`${key}`, `${page}`],
      });
    });
  }

  return result;
}

/*
 * 如果只有一个参数为分页
 * 如果有两个参数则代表为分类id和分页数据
 */
export default async function Page(props: Props) {
  const {
    params: { rest },
  } = props;
  let [type, page] = rest;
  // 确保位置正确
  if (type && !page) {
    page = type;
    type = "all";
  }

  const result = (await client.api.issues.search
    .$get({ query: { page: page!, type } })
    .then((res) => res.json())) as {
    page: number[];
    data: ResultArticle[];
  };

  const { page: pageAll, data: allArticles } = result;

  const pagingList: PagingList[] = pageAll.map((item) => {
    return {
      url: ["/page", type, item].filter((f) => f && f !== "all").join("/"),
      label: `${item}`,
    };
  });

  return (
    <>
      <article>
        <Title>最新文章</Title>
        <div className="bg-white rounded-12">
          {allArticles.map((item, index) => {
            const time = dayjs(item.updated_at).format("YYYY-MM-DD");
            return (
              <React.Fragment key={item.id}>
                <section className="p-x-40 p-y-30">
                  <h3 className="m-0 p-0 font-500 text-size-20px colir-#222 lh-23px mb-10">
                    {item.title}
                  </h3>

                  <p className="color-#666 lh-24px text-size-16px p-0 m-0 mb-20">
                    {item.intro} ...
                  </p>
                  {!!item.imgs.length && (
                    <div className="flex">
                      {item.imgs.slice(0, 3).map((src, index) => {
                        return (
                          <div
                            key={src}
                            className={classnames([
                              `pos-relative w-200 h-120`,
                              {
                                "mr-10": index !== 2,
                              },
                            ])}
                          >
                            <Image
                              priority
                              src={src}
                              fill
                              style={{
                                objectFit: "cover",
                              }}
                              sizes="50rem"
                              alt={src}
                            ></Image>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center color-#999 lh-24px text-size-16px mt-20">
                    <div>
                      {item.labels.map((li, index) => {
                        return (
                          <span
                            className={classnames({
                              "mr-10": index !== item.labels.length - 1,
                            })}
                            key={li.id}
                          >
                            {li.name}
                          </span>
                        );
                      })}
                    </div>
                    <time className="ml-20" dateTime={time}>
                      {time}
                    </time>
                  </div>
                </section>
                {index !== allArticles.length - 1 && (
                  <div className="1pxbor m-x-40 w-auto"></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </article>
      <Paging list={pagingList}></Paging>
    </>
  );
}
