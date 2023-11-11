import { useMemo } from "react";
import data, { classification } from "@blog/user-data";
import NotFound from "./not-found";
import { Content } from "@/app/components/content";
import { PAGETOTAL } from "@/app/constant";

interface Params {
  rest: [string] | [string, string];
}
interface Props {
  params: Params;
  searchParams: Record<string, string>;
}

// 设置动态标题
export async function generateMetadata({
  params: {
    rest: [id],
  },
}: Props) {
  const current = data.label.find((f) => f.id === +id);

  return {
    title: current?.name,
  };
}

export function generateStaticParams(): Params[] {
  const result: Params[] = [];
  classification.forEach((value, key) => {
    result.push({
      rest: [key],
    });
    const length = Math.ceil(value.size / PAGETOTAL);
    Array.from({ length: length }).forEach((_, index) => {
      result.push({
        rest: [key, `${index + 1}`],
      });
    });
  });

  return result;
}

export default function Page({
  params: {
    rest: [id, page = "1"],
  },
}: Props) {
  const current = useMemo(() => {
    return data.label.find((f) => f.id === +id);
  }, [id]);

  const currentData = useMemo(() => {
    return Array.from(classification.get(id) || []).slice(
      (+page - 1) * PAGETOTAL,
      +page * PAGETOTAL
    );
  }, [id, page]);

  const length = useMemo(() => {
    const size = currentData.length;
    return Math.ceil(size / PAGETOTAL);
  }, [currentData]);

  const pagingData = useMemo(() => {
    return Array.from({ length }).map((item, index) => {
      return {
        label: `${index + 1}`,
        url: `${id}/${index + 1}`,
        page: index + 1,
      };
    });
  }, [id, length]);

  if (!current) {
    return <NotFound></NotFound>;
  }
  // Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".
  // 改用字符串替换形式传递
  const titleJumpPath = `/details/<ARTICLE_ID>/${id}`;

  return (
    <Content
      data={data}
      currentData={currentData}
      title={current.name}
      page={+page}
      pagingData={pagingData}
      jumpPath={titleJumpPath}
    />
  );
}
