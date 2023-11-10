import { FC, useMemo } from "react";
import data, { classification } from "@blog/user-data";
import NotFound from "./not-found";
import { Content } from "@/app/components/content";
import { PAGETOTAL } from "@/app/constant";

interface Props {
  params: { rest: string[] };
  searchParams: Record<string, string>;
}

const Details: FC<Props> = ({
  params: {
    rest: [id, page = "1"],
  },
}) => {
  const current = useMemo(() => {
    return data.label.find((f) => f.id === +id);
  }, [id]);

  const contentData = useMemo(() => {
    return Array.from(classification.get(id) || []).slice(
      (+page - 1) * PAGETOTAL,
      +page * PAGETOTAL
    );
  }, [id, page]);

  const length = useMemo(() => {
    const size = contentData.length;
    return Math.ceil(size / PAGETOTAL);
  }, [contentData]);

  const pageData = useMemo(() => {
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
      contentData={contentData}
      title={current.name}
      page={+page}
      pageData={pageData}
      titleJumpPath={titleJumpPath}
    />
  );
};

export default Details;
