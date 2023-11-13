import data from "@blog/side-effect";
import { PAGETOTAL } from "@/app/constant";
import { Suspense } from "react";
import { PageCopy } from "./pageCopy";
import Loading from "@/app/loading";

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

  return (
    <>
      <Suspense fallback={<Loading title="最新文章"></Loading>}>
        <PageCopy page={+page} data={data}></PageCopy>
      </Suspense>
    </>
  );
}
