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
    rest: [id, page],
  },
}) => {
  const current = useMemo(() => {
    return data.label.find((f) => f.id === +id);
  }, [id]);

  const contentData = useMemo(() => {
    return Array.from(classification.get(id) || []);
  }, [id]);

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

  return (
    <Content
      contentData={contentData}
      title={current.name}
      page={+page}
      pageData={pageData}
    />
  );
};

export default Details;
