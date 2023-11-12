import { Content } from "@/app/components/content";
import data from "@blog/side-effect";
import { Props as PageNumberProps } from "@/app/components/content/pageNumber";
import { PAGETOTAL } from "@/app/constant";
import { useMemo, Suspense } from "react";
import { PageCopy } from "./pageCopy";

interface Params {
  // 当前页数
  page: string;
}

interface Props {
  params: Params;
  searchParams: Record<string, string>;
}

export function generateStaticParams(): Params[] {
  // 把所有可能的结果都返回出来
  const length = Math.ceil(data.issuesData.length / PAGETOTAL);
  return Array.from({ length: length }).map((_, index) => {
    return {
      page: `${index + 1}`,
    };
  });
}

export default function Page(props: Props) {
  const {
    params: { page },
  } = props;
  const filteredData = useMemo(() => {
    return data.issuesData;
  }, []);

  const pageData = useMemo(() => {
    return Math.ceil(filteredData.length / PAGETOTAL);
  }, [filteredData]);

  const obj: PageNumberProps = {
    pagingData: Array.from({ length: pageData }).map((item, index) => {
      return {
        page: index + 1,
        label: `${index + 1}`,
        url: `/page/${index + 1}`,
      };
    }),
    page: +page,
  };

  const currentData = filteredData.slice(
    (+page - 1) * PAGETOTAL,
    +page * PAGETOTAL
  );

  return (
    <>
      <Suspense
        fallback={
          <Content
            title="最新文章"
            currentData={currentData}
            {...obj}
            data={data}
          ></Content>
        }
      >
        <PageCopy page={+page} data={data}></PageCopy>
      </Suspense>
    </>
  );
}
